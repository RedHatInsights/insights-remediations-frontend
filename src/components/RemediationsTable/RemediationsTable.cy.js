import RemediationsTable from './RemediationsTable';

describe('RemediationsTable tests', () => {
  beforeEach(() => {
    cy.mountWithContext(RemediationsTable);
  });
  it('renders the table correctly', () => {
    cy.get('body');
  });
});
