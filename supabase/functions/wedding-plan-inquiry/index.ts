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
    const {
      couple_name, phone, wedding_date, table_count,
      budget_per_table, wedding_style, remarks, recommended_halls,
    } = body

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
      .from('wedding_plan_inquiries')
      .insert({
        couple_name,
        phone,
        wedding_date: wedding_date || null,
        table_count: table_count ? Number(table_count) : null,
        budget_per_table: budget_per_table || null,
        wedding_style: wedding_style || null,
        remarks: remarks || null,
        recommended_halls: recommended_halls || [],
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
      '💒 新婚宴咨询询单',
      [
        `新人：${couple_name}`,
        `电话：${phone}`,
        wedding_date      ? `婚期：${wedding_date}`              : null,
        table_count       ? `桌数：${table_count}桌`             : null,
        budget_per_table  ? `预算：${budget_per_table}元/桌`     : null,
        wedding_style     ? `风格：${wedding_style}`             : null,
        remarks           ? `备注：${remarks}`                   : null,
      ].filter(Boolean).join('\n')
    )

    return new Response(
      JSON.stringify({
        success: true,
        message: '咨询提交成功！婚宴顾问将尽快联系您。',
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
