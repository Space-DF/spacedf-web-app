import { Button } from '@/components/ui/button'
import React from 'react'
import { useDeleteSpace } from '../../(auth)/spaces/hooks'

const MethodDelete = () => {
  const { deleteSpaceTrigger } = useDeleteSpace()
  const handleDeleteSpace = async () => {
    try {
      await deleteSpaceTrigger({
        slug_name: 'default-9',
      })
    } catch (error) {}
  }
  return (
    <div>
      <Button onClick={handleDeleteSpace}>MethodDelete</Button>
    </div>
  )
}

export default MethodDelete
