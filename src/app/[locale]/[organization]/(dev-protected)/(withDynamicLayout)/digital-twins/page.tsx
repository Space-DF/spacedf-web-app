import dynamic from 'next/dynamic'

// const currentTemplate = 'fleet-tracking'
const currentTemplate = 'smart-building'

const templateImporters = {
  'smart-building': () => import('@/templates/smart-building'),
  'fleet-tracking': () => import('@/templates/fleet-tracking'),
}

const Template = dynamic(templateImporters[currentTemplate], {
  ssr: false,
})

export default function DigitalTwins() {
  return <Template />
}
