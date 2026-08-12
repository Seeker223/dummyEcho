import React from 'react'
import styled from 'styled-components'

const SkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    ${({ theme }) => (theme.mode === 'dark' ? '#2d3748' : '#e5e7eb')} 0%,
    ${({ theme }) => (theme.mode === 'dark' ? '#4a5568' : '#f3f4f6')} 50%,
    ${({ theme }) => (theme.mode === 'dark' ? '#2d3748' : '#e5e7eb')} 100%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`

export const SkeletonImage = styled(SkeletonBase)`
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || '200px'};
  border-radius: ${({ $borderRadius }) => $borderRadius || '8px'};
`

export const SkeletonLogo = styled(SkeletonBase)`
  width: ${({ width }) => width || '40px'};
  height: ${({ height }) => height || '40px'};
  border-radius: ${({ $borderRadius }) => $borderRadius || '8px'};
`

export const SkeletonText = styled(SkeletonBase)`
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || '16px'};
  border-radius: ${({ $borderRadius }) => $borderRadius || '4px'};
`

export function ImageWithSkeleton({ src, alt, width, height, borderRadius, onLoad, ...props }) {
  const [isLoading, setIsLoading] = React.useState(true)

  const handleImageLoad = () => {
    setIsLoading(false)
    if (onLoad) onLoad()
  }

  return (
    <>
      {isLoading && <SkeletonImage width={width} height={height} $borderRadius={borderRadius} />}
      <img
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        style={{ display: isLoading ? 'none' : 'block', borderRadius: borderRadius || '8px', width: width || '100%', height: height || '200px' }}
        {...props}
      />
    </>
  )
}

export function LogoWithSkeleton({ src, alt, width = '40px', height = '40px', onLoad, ...props }) {
  const [isLoading, setIsLoading] = React.useState(true)

  const handleImageLoad = () => {
    setIsLoading(false)
    if (onLoad) onLoad()
  }

  return (
    <>
      {isLoading && <SkeletonLogo width={width} height={height} $borderRadius="8px" />}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoad={handleImageLoad}
        style={{ display: isLoading ? 'none' : 'block', borderRadius: '8px', width, height }}
        {...props}
      />
    </>
  )
}
