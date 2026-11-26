import { CalculationResult, CalculatorMeta } from '../types';

/**
 * Downloads a professionally formatted Word Document (.doc) compatible with
 * Microsoft Word, Google Docs, and LibreOffice.
 */
export function downloadWordReport(
  calculator: CalculatorMeta,
  result: CalculationResult,
  inputs: Record<string, any>,
  meta?: {
    projectName?: string;
    engineerName?: string;
    organization?: string;
  }
) {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const projectName = meta?.projectName || 'Water Resources & Environmental Design';
  const engineerName = meta?.engineerName || 'Eng. Eraj Karimi (P.E.)';
  const organization = meta?.organization || 'AquaCalc Engineering Suite';

  // Build inputs table rows
  const inputRows = Object.entries(inputs)
    .filter(([k, v]) => typeof v !== 'object')
    .map(
      ([key, val]) => `
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #d1d5db; font-family: monospace; font-size: 11pt; background-color: #f9fafb;">${escapeHtml(key)}</td>
        <td style="padding: 8px 12px; border: 1px solid #d1d5db; font-weight: bold; font-size: 11pt;">${escapeHtml(String(val))}</td>
      </tr>
    `
    )
    .join('');

  // Build secondary outputs table rows
  const outputRows = result.secondaryOutputs
    .map(
      (out) => `
      <tr>
        <td style="padding: 8px 12px; border: 1px solid #d1d5db; font-size: 11pt; background-color: #f9fafb;">${escapeHtml(out.label)}</td>
        <td style="padding: 8px 12px; border: 1px solid #d1d5db; font-weight: bold; font-size: 11pt; color: #0f766e;">${escapeHtml(String(out.value))} <span style="font-weight: normal; color: #4b5563;">${escapeHtml(out.unit)}</span></td>
        <td style="padding: 8px 12px; border: 1px solid #d1d5db; font-size: 10pt; color: #6b7280;">${escapeHtml(out.description || '—')}</td>
      </tr>
    `
    )
    .join('');

  // Build step-by-step derivations
  const stepRows = result.steps
    .map(
      (s, idx) => `
      <div style="margin-bottom: 16px; padding: 12px; border-left: 4px solid #0d9488; background-color: #f8fafc;">
        <p style="margin: 0 0 6px 0; font-weight: bold; color: #0f172a; font-size: 11pt;">Step ${idx + 1}: ${escapeHtml(s.stepName)}</p>
        <p style="margin: 0 0 4px 0; font-family: 'Courier New', monospace; color: #0369a1; font-size: 10.5pt;"><strong>Formula:</strong> ${escapeHtml(s.formula)}</p>
        <p style="margin: 0 0 4px 0; font-family: 'Courier New', monospace; color: #475569; font-size: 10pt;"><strong>Substitution:</strong> ${escapeHtml(s.substitution)}</p>
        <p style="margin: 0; font-weight: bold; color: #0d9488; font-size: 11pt;"><strong>Result:</strong> ${escapeHtml(s.result)}</p>
        ${s.note ? `<p style="margin: 4px 0 0 0; font-size: 9.5pt; color: #64748b; font-style: italic;">Note: ${escapeHtml(s.note)}</p>` : ''}
      </div>
    `
    )
    .join('');

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${escapeHtml(calculator.name)} - AquaCalc Engineering Report</title>
      <style>
        body {
          font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #1e293b;
          margin: 40px;
        }
        h1 {
          font-size: 20pt;
          color: #0f172a;
          margin-bottom: 4px;
        }
        h2 {
          font-size: 14pt;
          color: #0f766e;
          border-bottom: 2px solid #0d9488;
          padding-bottom: 4px;
          margin-top: 24px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;
        }
        th {
          background-color: #0d9488;
          color: white;
          padding: 8px 12px;
          border: 1px solid #0d9488;
          text-align: left;
          font-size: 11pt;
        }
        .header-box {
          border-bottom: 3px double #0d9488;
          padding-bottom: 12px;
          margin-bottom: 24px;
        }
        .result-highlight {
          background-color: #f0fdfa;
          border: 2px solid #0d9488;
          padding: 16px;
          text-align: center;
          margin: 16px 0;
          border-radius: 8px;
        }
        .primary-val {
          font-size: 26pt;
          font-weight: bold;
          color: #0d9488;
        }
        .footer-note {
          margin-top: 36px;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
          font-size: 9pt;
          color: #64748b;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header-box">
        <table style="border: none; margin: 0;">
          <tr>
            <td style="border: none; vertical-align: top;">
              <h1 style="margin: 0; color: #0d9488;">AquaCalc Engineering Calculation Report</h1>
              <div style="font-size: 13pt; font-weight: bold; color: #334155;">${escapeHtml(calculator.name)}</div>
              <div style="font-size: 10pt; color: #64748b; margin-top: 4px;">Standard: ${escapeHtml(calculator.standardReference)}</div>
            </td>
            <td style="border: none; text-align: right; vertical-align: top; font-size: 10pt; color: #475569;">
              <div><strong>Project:</strong> ${escapeHtml(projectName)}</div>
              <div><strong>Analyst:</strong> ${escapeHtml(engineerName)}</div>
              <div><strong>Org:</strong> ${escapeHtml(organization)}</div>
              <div><strong>Date:</strong> ${escapeHtml(dateStr)}</div>
            </td>
          </tr>
        </table>
      </div>

      <div class="result-highlight">
        <div style="font-size: 11pt; text-transform: uppercase; letter-spacing: 1px; color: #0f766e; font-weight: bold;">Primary Calculated Parameter</div>
        <div style="font-size: 12pt; color: #334155; margin-top: 4px;">${escapeHtml(result.primaryLabel)}</div>
        <div class="primary-val">${escapeHtml(String(result.primaryValue))} <span style="font-size: 14pt; color: #475569;">${escapeHtml(result.primaryUnit)}</span></div>
        ${result.statusLabel ? `<div style="display: inline-block; padding: 4px 12px; background-color: #ccfbf1; color: #0f766e; font-weight: bold; border-radius: 4px; margin-top: 8px;">Status: ${escapeHtml(result.statusLabel)}</div>` : ''}
      </div>

      <h2>1. Input Parameters</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 40%;">Parameter / Variable</th>
            <th style="width: 60%;">Design Value</th>
          </tr>
        </thead>
        <tbody>
          ${inputRows}
        </tbody>
      </table>

      <h2>2. Detailed Engineering Outputs</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 35%;">Metric</th>
            <th style="width: 30%;">Calculated Result</th>
            <th style="width: 35%;">Engineering Description</th>
          </tr>
        </thead>
        <tbody>
          ${outputRows}
        </tbody>
      </table>

      <h2>3. Mathematical Derivations &amp; Governing Equations</h2>
      ${stepRows}

      <h2>4. Reference &amp; Standard Citations</h2>
      <p style="padding: 10px; background-color: #f1f5f9; border-left: 3px solid #64748b; font-size: 10pt; color: #334155;">
        ${escapeHtml(result.reference || calculator.standardReference)}
      </p>

      <div class="footer-note">
        This calculation sheet was generated via AquaCalc Technical Suite. Formulas conform to published peer-reviewed water resources, wastewater, and hydrologic engineering standards.
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + wordHtml], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = `AquaCalc_${sanitizeFilename(calculator.name)}_${new Date().toISOString().slice(0, 10)}.doc`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a high-resolution PNG snapshot of the calculation card / workspace.
 */
export function downloadPngReport(
  calculator: CalculatorMeta,
  result: CalculationResult,
  inputs: Record<string, any>
) {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 900;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#0c3547');
  bgGrad.addColorStop(1, '#071a25');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Card background
  ctx.fillStyle = '#ffffff';
  ctx.roundRect(40, 40, width - 80, height - 80, 16);
  ctx.fill();

  // Header banner
  const bannerGrad = ctx.createLinearGradient(40, 40, width - 40, 40);
  bannerGrad.addColorStop(0, '#0d9488');
  bannerGrad.addColorStop(1, '#0284c7');
  ctx.fillStyle = bannerGrad;
  ctx.roundRect(40, 40, width - 80, 110, [16, 16, 0, 0]);
  ctx.fill();

  // Header Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('AquaCalc Engineering Calculation Report', 70, 85);

  ctx.font = 'normal 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#ccfbf1';
  ctx.fillText(calculator.name, 70, 115);

  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  ctx.textAlign = 'right';
  ctx.font = 'normal 14px monospace';
  ctx.fillStyle = '#e2e8f0';
  ctx.fillText(`DATE: ${dateStr}`, width - 70, 85);
  ctx.fillText('PRO VERIFIED', width - 70, 115);
  ctx.textAlign = 'left';

  // Primary Result Box
  ctx.fillStyle = '#f0fdfa';
  ctx.strokeStyle = '#0d9488';
  ctx.lineWidth = 2;
  ctx.roundRect(70, 180, width - 140, 140, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0f766e';
  ctx.font = 'bold 15px monospace';
  ctx.fillText(result.primaryLabel.toUpperCase(), 100, 215);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 44px "Plus Jakarta Sans", sans-serif';
  const valText = `${result.primaryValue} ${result.primaryUnit}`;
  ctx.fillText(valText, 100, 275);

  if (result.statusLabel) {
    ctx.fillStyle = '#0d9488';
    ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`● ${result.statusLabel}`, 100, 305);
  }

  // Left Column: Key Inputs
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Design Inputs', 70, 365);

  let yPos = 400;
  const inputEntries = Object.entries(inputs).slice(0, 6);
  ctx.font = 'normal 15px monospace';
  inputEntries.forEach(([key, val]) => {
    ctx.fillStyle = '#64748b';
    ctx.fillText(key, 80, yPos);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(String(val), 320, yPos);
    ctx.font = 'normal 15px monospace';
    yPos += 34;
  });

  // Right Column: Key Engineering Outputs
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Calculated Secondary Parameters', 540, 365);

  let outY = 400;
  const outputs = result.secondaryOutputs.slice(0, 6);
  outputs.forEach((out) => {
    ctx.fillStyle = '#475569';
    ctx.font = 'normal 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(out.label, 540, outY);

    ctx.fillStyle = '#0d9488';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`${out.value} ${out.unit}`, 900, outY);
    outY += 34;
  });

  // Bottom standard reference footer
  ctx.fillStyle = '#f8fafc';
  ctx.roundRect(70, height - 190, width - 140, 80, 8);
  ctx.fill();

  ctx.fillStyle = '#475569';
  ctx.font = 'normal 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Engineering Standard Reference:', 90, height - 155);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'italic 13px "Plus Jakarta Sans", sans-serif';
  const refText = calculator.standardReference.length > 110 
    ? calculator.standardReference.substring(0, 110) + '...'
    : calculator.standardReference;
  ctx.fillText(refText, 90, height - 130);

  // Footer branding
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'normal 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Generated by AquaCalc Technical Engine · Peer-reviewed civil, environmental & water resources algorithms', 70, height - 60);

  // Convert to image and trigger download
  const dataUrl = canvas.toDataURL('image/png');
  const downloadLink = document.createElement('a');
  downloadLink.href = dataUrl;
  downloadLink.download = `AquaCalc_${sanitizeFilename(calculator.name)}_${new Date().toISOString().slice(0, 10)}.png`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
