import { Button } from '@/components/ui/button'
import React from 'react'
import { useUpdateSpace } from '../../(auth)/spaces/hooks'

const MethodPatch = () => {
  const { updateSpaceTrigger } = useUpdateSpace()
  const handleUpdateSpace = async () => {
    try {
      await updateSpaceTrigger({
        spaceId: 27,
        slug_name: 'default-9',
        dataUpdate: {
          name: 'Update Space',
        },
      })
    } catch (error) {}
  }
  return (
    <div>
      <Button onClick={handleUpdateSpace}>MethodPatch</Button>
    </div>
  )
}

export default MethodPatch
