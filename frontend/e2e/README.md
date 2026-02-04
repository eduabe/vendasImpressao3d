# E2E Tests with Playwright

This directory contains end-to-end (E2E) tests for the frontend application using Playwright.

## Prerequisites

Before running the E2E tests, make sure:

1. **Frontend is running** on `http://localhost:3000`

   ```bash
   cd frontend
   npm start
   ```

2. **Backend is running** on `http://localhost:3001`

   ```bash
   cd backend
   npm start
   ```

3. **Database is configured** with at least one platform registered

## Installation

Playwright is already installed as a dev dependency. To install Playwright browsers:

```bash
cd frontend
npx playwright install
```

## Running Tests

### Run all E2E tests

```bash
cd frontend
npm run test:e2e
```

### Run tests with UI mode (interactive)

```bash
cd frontend
npm run test:e2e:ui
```

This opens an interactive UI where you can:

- Select which tests to run
- Watch tests execute in real-time
- Inspect the DOM and network requests
- Debug test failures

### View test report

After running tests, view the HTML report:

```bash
cd frontend
npm run test:e2e:report
```

## Test Coverage

The E2E tests cover:

1. **Update Sales Costs** - Validates that `custoImpressao` and `custoEnvio` can be updated and persist correctly
2. **Persistence After Reload** - Ensures values remain after page reload
3. **Platform Change** - Tests simultaneous platform and cost updates
4. **Required Field Validation** - Verifies error handling for missing required fields
5. **Description Update** - Tests updating sale descriptions
6. **Field Isolation** - Ensures updating costs doesn't affect other fields

## Test Structure

### Helpers (`helpers.js`)

Reusable helper functions for common test operations:

- `criarVendaDeTeste(page, dados)` - Creates a test sale via API
- `navegarParaListaDeVendas(page)` - Navigates to sales list
- `selecionarVenda(page, descricao)` - Selects a sale by description
- `preencherFormulario(page, campos)` - Fills form fields
- `salvarAlteracoes(page)` - Saves form changes
- `deletarVendaDeTeste(page, id)` - Deletes test sale

### Test Suite (`sale-update.spec.js`)

Main test suite with 6 test cases covering the complete user flow for updating sales.

## Debugging

### When a test fails:

1. **Check screenshots**: Automatically captured in `frontend/e2e/test-results/`
2. **Check traces**: Recorded on first retry, view with:
   ```bash
   npx playwright show-trace frontend/e2e/traces/[trace-file].zip
   ```
3. **Run in UI mode**: Use `npm run test:e2e:ui` to see what's happening

### Common Issues:

**"No platforms found in database"**

- Make sure the backend is running
- Check that at least one platform exists in the database
- You can create platforms via the frontend UI or API

**"Element not found"**

- Ensure the frontend is fully loaded before running tests
- Check that `data-testid` attributes are present in the components
- Increase timeout values in the test if needed

**"Connection refused"**

- Verify both frontend and backend servers are running
- Check port numbers (frontend: 3000, backend: 3001)

## Adding New Tests

1. Create a new test file in `frontend/e2e/` (e.g., `new-feature.spec.js`)
2. Use helpers from `helpers.js` when possible
3. Follow the GIVEN/WHEN/THEN pattern for clarity
4. Add `data-testid` attributes to any new UI elements you need to interact with
5. Run the test to verify it works

## Best Practices

- Use `data-testid` attributes instead of CSS selectors for stability
- Wait for elements to be visible before interacting with them
- Clean up test data in `afterEach` hooks
- Keep tests focused and independent (don't depend on test execution order)
- Use meaningful test descriptions (in Portuguese, following project conventions)
- Add comments to explain complex test logic

## CI/CD Integration

To run E2E tests in CI/CD:

1. Start both backend and frontend services
2. Run `npm run test:e2e` with appropriate timeout
3. Store test artifacts (screenshots, traces, videos)
4. Fail the build if any test fails

Example CI configuration:

```yaml
- name: Run E2E Tests
  run: |
    cd frontend
    npm run test:e2e
  timeout-minutes: 10
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen) - Generate tests by recording actions
