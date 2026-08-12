import { useEffect, useState } from 'react'
import { fetchPageMetadata } from '../services/workflowService'

export function useWorkflowData(pageId) {
  const [data, setData] = useState({ description: '', source: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function run() {
      setIsLoading(true)
      setError('')
      try {
        const result = await fetchPageMetadata(pageId, { signal: controller.signal })
        setData(result)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Could not load workflow metadata.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    run()
    return () => controller.abort()
  }, [pageId])

  return { data, isLoading, error }
}
