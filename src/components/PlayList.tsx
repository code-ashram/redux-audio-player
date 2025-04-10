import { FC } from 'react'
import { Card } from '@/components/ui/card'
import { Table } from '@/components/ui/table'
import { useTheme } from '@/components/theme-provider.tsx'

const PlayList: FC = () => {
  const { theme } = useTheme()

  return (
    <Card className="py-0 px-0 w-full h-[230px] rounded-none">
      <Table aria-label="Products" className="py-0 px-0">
        <Table.Header className="sticky top-0 z-10 cursor-default">
          <Table.Column className={theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}>#</Table.Column>

          <Table.Column className={theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'} isRowHeader>Name</Table.Column>

          <Table.Column className={theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}>Album</Table.Column>

          <Table.Column className={theme === 'light' ? 'bg-white text-black' : 'bg-black text-white'}>
            <p>Length</p>
          </Table.Column>
        </Table.Header>

        <Table.Body className="overflow-y-scroll" items={products}>
          {(item) => (
            <Table.Row className="playlist text-left border-t-[#121215] cursor-pointer" id={item.id}>
              <Table.Cell>{item.id}</Table.Cell>

              <Table.Cell>{item.name}</Table.Cell>

              <Table.Cell>{item.album}</Table.Cell>

              <Table.Cell>{item.length}</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </Card>
  )
}

export default PlayList

const products = [
  {
    id: '1',
    name: 'On The Steps Of Varanasi',
    album: 'Funeral Pyre',
    length: '16:00'
  },
  {
    id: '2',
    name: 'Old Age, Illness, Death And Rebirth',
    album: 'Funeral Pyre',
    length: '14:00'
  },
  {
    id: '3',
    name: 'Chant Or Die!',
    album: 'Funeral Pyre',
    length: '08:00'
  },
  {
    id: '4',
    name: 'Sharanagati',
    album: 'Funeral Pyre',
    length: '03:12'
  },
  {
    id: '5',
    name: 'Embrace Of Maya',
    album: 'Funeral Pyre',
    length: '14:08'
  },
  {
    id: '6',
    name: 'Rage Of Kiryadeva',
    album: 'Funeral Pyre',
    length: '05:45'
  }
]
