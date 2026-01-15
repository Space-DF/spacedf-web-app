import dynamic from 'next/dynamic'

const currentTemplate = 'fleet-tracking'
export default function DigitalTwins() {
  const Template = dynamic(
    () => import(`@/containers/templates/${currentTemplate}`),
    {
      ssr: false,
    }
  )

  return <Template />
}
