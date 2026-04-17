import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateTicketId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `TK-${timestamp}-${random}`
}

function getPriorityByType(feedback_type: string): string {
  const priorityMap: Record<string, string> = {
    general: 'normal',
    cooperation: 'normal',
    recruitment: 'normal',
    booking: 'high',
    'lost-found': 'high',
    complaint: 'urgent',
    vip: 'urgent',
  }
  return priorityMap[feedback_type] ?? 'normal'
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
      feedback_type, name, phone, email, wechat,
      subject, content, preferred_contact, expected_time,
    } = body

    if (!feedback_type || !name || !phone || !subject || !content) {
      return new Response(
        JSON.stringify({ error: '反馈类型、姓名、电话、主题和内容为必填项' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: '请输入有效的11位手机号码' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const ticket_id = generateTicketId()
    const priority = getPriorityByType(feedback_type)

    const { data, error } = await supabase
      .from('customer_feedback')
      .insert({
        ticket_id,
        feedback_type,
        name,
        phone,
        email: email || null,
        wechat: wechat || null,
        subject,
        content,
        preferred_contact: preferred_contact || null,
        expected_time: expected_time || null,
        status: 'submitted',
        priority,
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

    return new Response(
      JSON.stringify({
        success: true,
        message: '反馈提交成功！',
        ticket_id: data.ticket_id,
        priority: data.priority,
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
