import { expect, test } from '@playwright/test';
import { waitForError } from '@sentry-internal/test-utils';

test.describe('client-side errors', () => {
  test('captures error thrown on click', async ({ page }) => {
    const errorPromise = waitForError('solidstart', async errorEvent => {
      return errorEvent?.exception?.values?.[0]?.value === 'Error thrown from Solid Start E2E test app';
    });

    await page.goto(`/client-error`);
    await page.locator('#errorBtn').click();
    const error = await errorPromise;

    expect(error).toMatchObject({
      exception: {
        values: [
          {
            type: 'Error',
            value: 'Error thrown from Solid Start E2E test app',
            mechanism: {
              type: 'instrument',
              handled: false,
            },
          },
        ],
      },
      transaction: '/client-error',
    });
    expect(error.tags).toMatchObject({ runtime: 'browser' });
    expect(error.transaction).toEqual('/client-error');
  });
});
