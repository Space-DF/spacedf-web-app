// pages/api/submit-form.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body

    // Process the form data (e.g., save it to a database)
    // Here you can add your logic to handle the form data

    res.status(200).json({
      message: 'Form submitted successfully',
      data: { password, email },
    })
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
