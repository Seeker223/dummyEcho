import styled from 'styled-components'

const Row = styled.article`
  display: flex;
  justify-content: space-between;
  padding: 14px 2px;
  border-bottom: 1px solid #eef2f7;

  &:last-child {
    border-bottom: 0;
  }
`

const Name = styled.p`
  margin: 0;
  font-weight: 600;
`

const Meta = styled.p`
  margin: 4px 0 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.88rem;
`

const Right = styled.div`
  text-align: right;
`

const Condition = styled.p`
  margin: 0;
  font-weight: 700;
`

const Response = styled.p`
  margin: 4px 0 0;
  font-size: 0.88rem;
  color: #16a34a;
`

export function EmergencyHistoryItem({ item }) {
  return (
    <Row>
      <div>
        <Name>{item.name}</Name>
        <Meta>
          {item.dateLabel} | Duration {item.duration}
        </Meta>
      </div>
      <Right>
        <Condition>{item.condition}</Condition>
        <Response>Response: {item.responseTime}</Response>
      </Right>
    </Row>
  )
}

