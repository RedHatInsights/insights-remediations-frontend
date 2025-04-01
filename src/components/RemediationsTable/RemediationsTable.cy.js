import RemediationsTable from "./RemediationsTable"

const MountRemediationsTable = () => {
    return (
        <TableStateProvider>
            <OverviewPage>

            </OverviewPage>
        </TableStateProvider>
    )
}

describe('RemediationsTable tests', () => {
    beforeEach(() => {
        cy.mount(RemediationsTable);
    })
    it('renders the table correctly', () => {
        cy.get('body');
    })
})