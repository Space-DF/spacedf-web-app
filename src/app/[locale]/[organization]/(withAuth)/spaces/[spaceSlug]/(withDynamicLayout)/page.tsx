import dynamic from 'next/dynamic'

const currentTemplate = 'device-maps'
export default function SpaceDetail() {
  const Template = dynamic(
    () => import(`@/containers/templates/${currentTemplate}`),
    {
      ssr: false,
    }
  )

  return <Template />
}
