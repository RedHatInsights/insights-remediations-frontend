import RemediationsTable from "./RemediationsTable"

describe('RemediationsTable tests', () => {
    beforeEach(() => {
        cy.mount(RemediationsTable);
    })
    it('renders the table correctly', () => {
        cy.get('body');
    })
})