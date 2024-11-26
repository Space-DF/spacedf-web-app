import { Button } from '@/components/ui/button'
import React from 'react'
import { useCreateSpace } from '../../(auth)/spaces/hooks'

const MethodPost = () => {
  const { createSpaceTrigger } = useCreateSpace()
  const handleCreateSpace = async () => {
    try {
      await createSpaceTrigger({
        name: 'New Space 2',
        logo: 'https://example.com/logo.png',
        slug_name: 'new-space-2',
      })
    } catch (error) {}
  }
  return (
    <div>
      <Button onClick={handleCreateSpace}>POST</Button>
    </div>
  )
}

export default MethodPost
