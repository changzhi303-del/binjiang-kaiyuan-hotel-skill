import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sendNotification(title: string, desp: string) {
  const key = Deno.env.get('SERVERCHAN_SENDKEY')!
  fetch(`https://sctapi.ftqq.com/${key}.send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `title=${encodeURIComponent(title)}&desp=${encodeURIComponent(desp)}`,
  }).catch(() => {})
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const body = await req.json()
    const { name, phone, checkin_date, checkout_date, room_type, guest_count, remarks } = body

    if (!name || !phone || !checkin_date || !checkout_date) {
      return new Response(
        JSON.stringify({ error: '姓名、联系电话、入住日期和退房日期为必填项' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: '请输入有效的11位手机号码' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data, error } = await supabase
      .from('room_booking_inquiries')
      .insert({
        name,
        phone,
        checkin_date,
        checkout_date,
        room_type: room_type || null,
        guest_count: guest_count ? Number(guest_count) : null,
        remarks: remarks || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return new Response(
        JSON.stringify({ error: '提交失败，请稍后重试' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    sendNotification(
      '🏨 新客房预订询单',
      [
        `姓名：${name}`,
        `电话：${phone}`,
        `入住：${checkin_date}`,
        `退房：${checkout_date}`,
        room_type   ? `房型：${room_type}`      : null,
        guest_count ? `人数：${guest_count}人`  : null,
        remarks     ? `备注：${remarks}`        : null,
      ].filter(Boolean).join('\n')
    )

    return new Response(
      JSON.stringify({
        success: true,
        message: '询单提交成功！前台将在工作时间内联系您确认，如需即时确认请拨打 0571-56971666。',
        data: { id: data.id },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(
      JSON.stringify({ error: '服务异常，请稍后重试' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
