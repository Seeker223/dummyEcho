import styled from 'styled-components'
import { Skeleton } from './Skeleton'

const Wrap = styled.div`
  width: 100%;
  padding: 18px;
  display: grid;
  gap: 14px;
`

const Card = styled.div`
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#e5e7eb'};
  border-radius: ${({ theme }) => theme?.radii?.lg || '16px'};
  background: ${({ theme }) => theme?.colors?.surface || '#ffffff'};
  padding: 16px;
  box-shadow: ${({ theme }) => theme?.shadow?.soft || '0 14px 30px rgba(15, 31, 68, 0.12)'};
`

const Row = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
`

export function Loader() {
  return (
    <Wrap>
      <Row>
        <Skeleton $w="44px" $h="44px" $r="14px" aria-hidden="true" />
        <div style={{ flex: 1 }}>
          <Skeleton $w="55%" $h="14px" $r="10px" aria-hidden="true" />
          <div style={{ height: 8 }} />
          <Skeleton $w="40%" $h="12px" $r="10px" aria-hidden="true" />
        </div>
      </Row>

      <Card aria-label="Loading content">
        <Skeleton $w="70%" $h="16px" $r="10px" aria-hidden="true" />
        <div style={{ height: 10 }} />
        <Skeleton $w="92%" $h="12px" $r="10px" aria-hidden="true" />
        <div style={{ height: 8 }} />
        <Skeleton $w="86%" $h="12px" $r="10px" aria-hidden="true" />
        <div style={{ height: 16 }} />
        <Grid>
          <Skeleton $h="54px" $r="14px" aria-hidden="true" />
          <Skeleton $h="54px" $r="14px" aria-hidden="true" />
          <Skeleton $h="54px" $r="14px" aria-hidden="true" />
          <Skeleton $h="54px" $r="14px" aria-hidden="true" />
        </Grid>
        <div style={{ height: 14 }} />
        <Skeleton $h="44px" $r="12px" aria-hidden="true" />
      </Card>
    </Wrap>
  )
}
