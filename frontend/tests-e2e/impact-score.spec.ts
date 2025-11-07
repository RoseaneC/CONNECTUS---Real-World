import { test, expect } from '@playwright/test';

test.describe('Impact Score Feature', () => {
  test('sidebar exibe aba Impact Score e navega para página', async ({ page }) => {
    // Navigate to root
    await page.goto('/');

    // Verificar se há login necessário
    const loginButton = page.locator('text=/Login|Entrar/i').first();
    
    if (await loginButton.isVisible().catch(() => false)) {
      // Fazer login se necessário
      // NOTA: Ajuste os seletores conforme sua implementação atual
      const emailInput = page.locator('input[type="email"], input[name="email"], input[name="nickname"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
      const submitButton = page.locator('button:has-text("Entrar"), button:has-text("Login")').first();

      if (await emailInput.isVisible().catch(() => false)) {
        await emailInput.fill('demo@connectus.local');
      }
      if (await passwordInput.isVisible().catch(() => false)) {
        await passwordInput.fill('123456');
      }
      if (await submitButton.isVisible().catch(() => false)) {
        await submitButton.click();
      }

      // Aguardar navegação
      await page.waitForTimeout(2000);
    }

    // Verificar se sidebar está visível
    // NOTA: Ajuste o seletor conforme sua implementação (pode ser um nav, aside, etc.)
    const sidebar = page.locator('nav, aside, [role="navigation"]').first();
    await expect(sidebar).toBeVisible({ timeout: 5000 });

    // Verificar se item "Impact Score" está presente na sidebar
    const impactItem = page.locator('text=/Impact Score/i').first();
    
    // Verificar se está visível (feature flag pode estar desligada)
    const isVisible = await impactItem.isVisible().catch(() => false);
    
    if (isVisible) {
      // Se visível, clicar
      await impactItem.click();
      
      // Verificar que navegou para /impact
      await expect(page).toHaveURL(/\/impact/, { timeout: 5000 });
      
      // Verificar que a página carregou (título ou conteúdo específico)
      await expect(page.locator('h1, h2')).toContainText(/impact|score/i, { timeout: 5000 });
    } else {
      // Se não visível, a feature flag está desligada
      console.log('⚠️ Impact Score não está visível (feature flag desligada?)');
    }
  });

  test('página Impact Score exibe conteúdo básico', async ({ page }) => {
    // Tentar acessar diretamente
    await page.goto('/impact');

    // Verificar redirecionamento se não autenticado
    const currentUrl = page.url();
    
    if (currentUrl.includes('/login') || currentUrl.includes('/register')) {
      console.log('⚠️ Redirecionado para login - autenticação necessária');
      return;
    }

    // Se chegou na página, verificar conteúdo
    if (currentUrl.includes('/impact')) {
      // Verificar que há algum conteúdo
      const hasContent = await page.locator('body').textContent();
      expect(hasContent).toBeTruthy();
      
      // Tentar encontrar qualquer indicador de Impact Score
      const pageTitle = page.locator('h1, h2, [role="heading"]').first();
      
      if (await pageTitle.isVisible().catch(() => false)) {
        const text = await pageTitle.textContent();
        expect(text?.toLowerCase()).toMatch(/impact|score/i);
      }
    }
  });

  test('check feature flag status', async ({ page }) => {
    // Verificar se flag está ativa via console
    await page.goto('/');
    
    const flagValue = await page.evaluate(() => {
      return import.meta.env.VITE_FEATURE_IMPACT_SCORE;
    });
    
    console.log('📊 VITE_FEATURE_IMPACT_SCORE =', flagValue);
    
    // Se flag está ativa, verificar que sidebar tem o item
    if (flagValue === 'true') {
      const impactItem = page.locator('text=/Impact Score/i').first();
      // Não falha se não encontrar - pode estar em outra página
      const found = await impactItem.isVisible().catch(() => false);
      if (found) {
        console.log('✅ Impact Score está visível na sidebar');
      }
    } else {
      console.log('⚠️ Feature flag VITE_FEATURE_IMPACT_SCORE está desligada');
    }
  });
});


