'use client'

import React from 'react'
import MethodPost from './post'
import MethodPatch from './patch'
import MethodDelete from './delete'
import useSWR from 'swr'
import { useGetSpaces } from '../../(auth)/spaces/hooks'
import { DataResponse } from '@/types/global'
import { Space } from '@/types/space'

const TestContainer = () => {
  const { data, isLoading } = useGetSpaces()

  const spaceList = data?.data?.results || []

  return (
    <div className="p-5">
      <div className="mb-5 flex items-center gap-5">
        <MethodPost />
        <MethodPatch />
        <MethodDelete />
      </div>
      <div>
        {isLoading && <div>Fetching...</div>}
        {!isLoading && (
          <ul>
            {spaceList.map((space) => (
              <li key={space.id}>{space.name}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default TestContainer
