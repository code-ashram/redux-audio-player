import { FC } from 'react'
import { Card } from '@/components/ui/card'
import { Table } from '@/components/ui/table'
import { useTheme } from '@/components/theme-provider.tsx'
import { setTableColumnColor } from '@/utils/helpers.ts'
import TrackList from '@/API/trackList.ts'

const PlayList: FC = () => {
  const { theme } = useTheme()

  return (
    <Card className="py-0 px-0 w-full h-[230px] rounded-none">
      <Table aria-label="Products" className="py-0 px-0">
        <Table.Header className="sticky top-0 z-10 cursor-default">
          <Table.Column className={setTableColumnColor(theme)}>#</Table.Column>
          <Table.Column className={setTableColumnColor(theme)} isRowHeader>Name</Table.Column>
          <Table.Column className={setTableColumnColor(theme)}>Album</Table.Column>
        </Table.Header>

        <Table.Body className="overflow-y-scroll" items={TrackList}>
          {(item) => (
            <Table.Row className="playlist text-left border-t-[#121215] cursor-pointer" id={item.id}>
              <Table.Cell>{item.id}</Table.Cell>
              <Table.Cell>{item.name}</Table.Cell>
              <Table.Cell>{item.album}</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </Card>
  )
}

export default PlayList
