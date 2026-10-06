import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('la página de inicio carga y no tiene violaciones de accesibilidad', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { level: 1, name: 'Usability Test Dashboard' }),
  ).toBeVisible();
  const resultado = await new AxeBuilder({ page }).analyze();
  expect(resultado.violations).toEqual([]);
});
