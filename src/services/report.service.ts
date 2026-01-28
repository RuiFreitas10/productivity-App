import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { formatCurrency } from '../utils/formatters';

export const reportService = {
    async generateMonthlyReportHTML(userName: string, monthLabel: string, financials: any, chartType: 'pie' | 'bar' | 'table') {
        const total = formatCurrency(financials.totalSpent);
        const topCategory = financials.topCategory ? `${financials.topCategory.category} (${formatCurrency(financials.topCategory.amount)})` : 'N/A';

        let chartSection = '';

        if (chartType === 'table') {
            const rows = financials.categories.map((c: any) => `
                <tr>
                    <td>${c.category}</td>
                    <td style="text-align: right;">${formatCurrency(c.amount)}</td>
                    <td style="text-align: right;">${Math.round((c.amount / financials.totalSpent) * 100)}%</td>
                </tr>
            `).join('');

            chartSection = `
                <h3>Detalhes por Categoria</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background-color: #fce4ec;">
                        <th style="text-align: left; padding: 8px;">Categoria</th>
                        <th style="text-align: right; padding: 8px;">Valor</th>
                        <th style="text-align: right; padding: 8px;">%</th>
                    </tr>
                    ${rows}
                </table>
            `;
        } else {
            // Placeholder for Charts in PDF (Charts are hard in HTML-to-PDF without external images)
            // We'll use a visual representation using simple CSS bars for "bar" type or a CSS Conic Gradient for "pie"

            if (chartType === 'pie') {
                // Simplified CSS Pie Chart approximation or just a list with colored bullets
                const listItems = financials.categories.map((c: any) => `
                    <div style="display: flex; align-items: center; margin-bottom: 5px;">
                        <span style="display: inline-block; width: 15px; height: 15px; background-color: ${c.color}; margin-right: 10px; border-radius: 50%;"></span>
                        <span style="flex: 1;">${c.category}</span>
                        <span>${formatCurrency(c.amount)}</span>
                    </div>
                `).join('');
                chartSection = `<h3>Distribuição Visual</h3><div style="padding: 10px;">${listItems}</div>`;
            } else {
                // Bar chart using HTML/CSS
                const bars = financials.categories.map((c: any) => {
                    const pct = Math.round((c.amount / financials.totalSpent) * 100);
                    return `
                        <div style="margin-bottom: 10px;">
                            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 2px;">
                                <span>${c.category}</span>
                                <span>${formatCurrency(c.amount)}</span>
                            </div>
                            <div style="width: 100%; background-color: #f1f1f1; height: 10px; border-radius: 5px;">
                                <div style="width: ${pct}%; background-color: ${c.color}; height: 100%; border-radius: 5px;"></div>
                            </div>
                        </div>
                     `;
                }).join('');
                chartSection = `<h3>Gráfico de Barras</h3><div style="padding: 10px;">${bars}</div>`;
            }
        }

        const html = `
            <html>
            <head>
                <style>
                    body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
                    h1 { color: #d81b60; border-bottom: 2px solid #d81b60; padding-bottom: 10px; }
                    .summary-card { background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                    .highlight { color: #d81b60; font-weight: bold; }
                    .footer { margin-top: 50px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
                </style>
            </head>
            <body>
                <h1>Relatório Financeiro Mensal</h1>
                <p><strong>Cliente:</strong> ${userName}</p>
                <p><strong>Mês de Referência:</strong> ${monthLabel}</p>
                
                <div class="summary-card">
                    <h2>Resumo</h2>
                    <p>Total Gasto: <span class="highlight">${total}</span></p>
                    <p>Maior Despesa: <span class="highlight">${topCategory}</span></p>
                </div>

                ${chartSection}
                
                <div class="footer">
                    Gerado por AI Personal Assistant - ${new Date().toLocaleDateString()}
                </div>
            </body>
            </html>
        `;
        return html;
    },

    async createAndSharePDF(html: string) {
        try {
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    }
};
