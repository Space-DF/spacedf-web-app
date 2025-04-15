import useSWRMutation from 'swr/mutation'

const switchSpaceFetcher = async (
  url: string,
  { arg }: { arg: { spaceSlug: string } }
) => {
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })
  const response = await res.json()
  if (!res.ok) {
    throw response
  }
  return response
}

const useSwitchSpace = () =>
  useSWRMutation('/api/spaces/switch-spaces', switchSpaceFetcher)

export default useSwitchSpace
