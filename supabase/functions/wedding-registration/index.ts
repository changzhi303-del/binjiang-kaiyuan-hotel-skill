import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const { couple_name, phone, wechat, wedding_date, guest_count, budget, remarks } = body

    if (!couple_name || !phone) {
      return new Response(
        JSON.stringify({ error: '新人姓名和联系电话为必填项' }),
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
      .from('wedding_show_registrations')
      .insert({
        couple_name,
        phone,
        wechat: wechat || null,
        wedding_date: wedding_date || null,
        guest_count: guest_count || null,
        budget: budget || null,
        remarks: remarks || null,
        event_name: '春日赴约婚礼秀',
        registration_time: new Date().toISOString(),
        status: 'registered',
      })
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return new Response(
        JSON.stringify({ error: '报名提交失败，请稍后重试' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '报名成功！婚礼顾问将在24小时内联系您。',
        data: { id: data.id, registration_time: data.registration_time },
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
