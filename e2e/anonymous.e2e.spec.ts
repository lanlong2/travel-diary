import { expect, test } from '@playwright/test'

test.describe('anonymous access', () => {
  test('shows the login page without using real credentials', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: /Cui Hao.*Li Mutong/ })).toBeVisible()
    await expect(page.getByLabel('邮箱')).toBeVisible()
    await expect(page.getByLabel('密码')).toBeVisible()
    await expect(page.getByRole('button', { name: '开门' })).toBeVisible()
  })

  test('keeps protected routes behind the login page', async ({ page }) => {
    await page.goto('/timeline')

    await expect(page.getByLabel('邮箱')).toBeVisible()
    await expect(page.getByRole('button', { name: '开门' })).toBeVisible()
  })

  test('validates an empty login form locally', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('邮箱').fill('')
    await page.getByLabel('密码').fill('')
    await page.getByRole('button', { name: '开门' }).click()

    await expect(page.getByRole('alert')).toHaveText('请输入邮箱和密码')
  })
})
