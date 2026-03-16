import Anthropic from '@anthropic-ai/sdk'

function getClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  })
}

export async function generateLeadResponse(params: {
  customerName: string
  message: string
  businessName: string
  businessPhone: string
}): Promise<string> {
  const { customerName, message, businessName, businessPhone } = params
  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `You are a friendly HVAC dispatcher for ${businessName}. A new customer just texted in.

Customer name: ${customerName || 'there'}
Their message: "${message}"

Write a SHORT, warm SMS reply (under 160 chars) that:
1. Acknowledges their request
2. Lets them know someone will call them shortly to schedule
3. Includes the callback number ${businessPhone}

Reply with ONLY the SMS text, no quotes or explanation.`,
      },
    ],
  })
  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  return content.text
}

export async function generateQuotes(params: {
  jobDescription: string
  businessName: string
}): Promise<QuoteTier[]> {
  const { jobDescription, businessName } = params
  const response = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `You are an expert HVAC estimator for ${businessName}. Generate a good/better/best quote for this job.

Job description: "${jobDescription}"

Return a JSON array with exactly 3 objects, one for each tier:
[
  {
    "tier": "good",
    "label": "Standard",
    "total": 0,
    "description": "brief description",
    "lineItems": [{"description": "...", "qty": 1, "unitPrice": 0, "total": 0}]
  },
  ...
]

Use realistic HVAC pricing. Better tier improves efficiency/warranty. Best tier is premium equipment with longest warranty.
Return ONLY the JSON array, no other text.`,
      },
    ],
  })
  const content = response.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')
  return JSON.parse(content.text) as QuoteTier[]
}

export interface QuoteTier {
  tier: 'good' | 'better' | 'best'
  label: string
  total: number
  description: string
  lineItems: Array<{
    description: string
    qty: number
    unitPrice: number
    total: number
  }>
}
