import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatFileSize,
  formatCategoryLabel,
  mapCategoryToGroup,
  uploadDocument,
  getDocumentProcessingResult,
  triggerDocumentReprocess,
  ApiError,
} from './documentApi.ts';

describe('Document API Client & Validation Tests', () => {
  it('formats byte sizes into clean human-readable units', () => {
    assert.equal(formatFileSize(0), '0 B');
    assert.equal(formatFileSize(1024), '1 KB');
    assert.equal(formatFileSize(2048500), '1.95 MB');
    assert.equal(formatFileSize(10485760), '10 MB');
  });

  it('formats statutory category slugs to regulatory display labels', () => {
    assert.equal(formatCategoryLabel('land_deed'), 'Land Title Registered Deed');
    assert.equal(formatCategoryLabel('fire_noc'), 'Fire & Rescue Services NOC');
    assert.equal(formatCategoryLabel('pwd_safety'), 'PWD Structural Stability Certificate');
    assert.equal(formatCategoryLabel('cadastral_map'), 'Cadastral GIS Boundary Map');
  });

  it('maps specific categories to correct dashboard group', () => {
    assert.equal(mapCategoryToGroup('land_deed'), 'Land');
    assert.equal(mapCategoryToGroup('cadastral_map'), 'Land');
    assert.equal(mapCategoryToGroup('fire_noc'), 'Safety');
    assert.equal(mapCategoryToGroup('pwd_safety'), 'Safety');
    assert.equal(mapCategoryToGroup('building_plan'), 'Safety');
    assert.equal(mapCategoryToGroup('lab_inspection'), 'Lab');
    assert.equal(mapCategoryToGroup('aicte_affidavit'), 'Academic');
  });

  it('rejects non-PDF files on the client before dispatch', async () => {
    const fakeTextFile = new File(['hello world'], 'test.txt', { type: 'text/plain' });

    await assert.rejects(
      async () => {
        await uploadDocument({
          file: fakeTextFile,
          applicationId: 'AICTE-EOA-2026-001',
          institutionId: 'INST-TN-8841',
          documentCategory: 'land_deed',
        });
      },
      (err: unknown) => {
        assert(err instanceof ApiError);
        assert.equal(err.statusCode, 400);
        assert(err.message.includes('Only PDF documents (.pdf) are permitted'));
        return true;
      }
    );
  });

  it('rejects empty files (0 bytes) before dispatch', async () => {
    const emptyPdf = new File([], 'empty.pdf', { type: 'application/pdf' });

    await assert.rejects(
      async () => {
        await uploadDocument({
          file: emptyPdf,
          applicationId: 'AICTE-EOA-2026-001',
          institutionId: 'INST-TN-8841',
          documentCategory: 'land_deed',
        });
      },
      (err: unknown) => {
        assert(err instanceof ApiError);
        assert.equal(err.statusCode, 400);
        assert(err.message.includes('empty'));
        return true;
      }
    );
  });

  it('rejects oversized files exceeding 10 MB limit before dispatch', async () => {
    // 11 MB dummy file
    const oversizedBlob = new Blob([new Uint8Array(11 * 1024 * 1024)]);
    const oversizedPdf = new File([oversizedBlob], 'oversized.pdf', { type: 'application/pdf' });

    await assert.rejects(
      async () => {
        await uploadDocument({
          file: oversizedPdf,
          applicationId: 'AICTE-EOA-2026-001',
          institutionId: 'INST-TN-8841',
          documentCategory: 'land_deed',
        });
      },
      (err: unknown) => {
        assert(err instanceof ApiError);
        assert.equal(err.statusCode, 413);
        assert(err.message.includes('exceeds the maximum statutory limit of 10 MB'));
        return true;
      }
    );
  });

  it('handles HTTP 409 duplicate upload response correctly', async () => {
    const validPdf = new File(['%PDF-1.4 test'], 'valid.pdf', { type: 'application/pdf' });

    // Mock global fetch to return 409
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          detail: 'Duplicate document detected: identical file registered with Document ID DOC-20261101-ABCD.',
        }),
        {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    };

    try {
      await assert.rejects(
        async () => {
          await uploadDocument({
            file: validPdf,
            applicationId: 'AICTE-EOA-2026-001',
            institutionId: 'INST-TN-8841',
            documentCategory: 'land_deed',
          });
        },
        (err: unknown) => {
          assert(err instanceof ApiError);
          assert.equal(err.statusCode, 409);
          assert.equal(err.isDuplicate, true);
          assert(err.message.includes('Duplicate document detected'));
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('handles HTTP 503 database service unavailable correctly', async () => {
    const validPdf = new File(['%PDF-1.4 test'], 'valid.pdf', { type: 'application/pdf' });

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          detail: 'Database service is unavailable.',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    };

    try {
      await assert.rejects(
        async () => {
          await uploadDocument({
            file: validPdf,
            applicationId: 'AICTE-EOA-2026-001',
            institutionId: 'INST-TN-8841',
            documentCategory: 'land_deed',
          });
        },
        (err: unknown) => {
          assert(err instanceof ApiError);
          assert.equal(err.statusCode, 503);
          assert.equal(err.isDatabaseOffline, true);
          assert(err.message.includes('Database persistence is currently unavailable'));
          return true;
        }
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('fetches real document processing results via getDocumentProcessingResult', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          document_id: 'DOC-20261102-TEST01',
          application_id: 'AICTE-EOA-2026-001',
          institution_id: 'INST-TN-8841',
          document_category: 'land_deed',
          original_filename: 'sample_deed.pdf',
          stored_filename: 'DOC-20261102-TEST01.pdf',
          file_size: 10240,
          sha256_hash: 'abc123hash',
          upload_timestamp: new Date().toISOString(),
          processing_status: 'processed',
          total_pages: 1,
          native_pages_count: 1,
          ocr_pages_count: 0,
          total_char_count: 120,
          total_word_count: 18,
          pages: [
            {
              page_number: 1,
              extraction_method: 'native',
              text: 'GOVERNMENT OF INDIA AICTE APPROVAL RECORD',
              char_count: 41,
              word_count: 6,
              has_images: false,
              ocr_applied: false,
            },
          ],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    };

    try {
      const res = await getDocumentProcessingResult('DOC-20261102-TEST01');
      assert.equal(res.document_id, 'DOC-20261102-TEST01');
      assert.equal(res.processing_status, 'processed');
      assert.equal(res.total_pages, 1);
      assert.equal(res.pages[0].extraction_method, 'native');
      assert(res.pages[0].text.includes('AICTE APPROVAL RECORD'));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('triggers manual reprocessing via triggerDocumentReprocess', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      return new Response(
        JSON.stringify({
          document_id: 'DOC-20261102-TEST02',
          application_id: 'AICTE-EOA-2026-001',
          institution_id: 'INST-TN-8841',
          document_category: 'fire_noc',
          original_filename: 'scanned_fire.pdf',
          stored_filename: 'DOC-20261102-TEST02.pdf',
          file_size: 20480,
          sha256_hash: 'def456hash',
          upload_timestamp: new Date().toISOString(),
          processing_status: 'processed',
          total_pages: 1,
          native_pages_count: 0,
          ocr_pages_count: 1,
          total_char_count: 85,
          total_word_count: 12,
          pages: [
            {
              page_number: 1,
              extraction_method: 'ocr',
              text: 'TAMIL NADU FIRE SERVICES NOC GRANTED',
              char_count: 36,
              word_count: 6,
              has_images: true,
              ocr_applied: true,
            },
          ],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    };

    try {
      const res = await triggerDocumentReprocess('DOC-20261102-TEST02');
      assert.equal(res.document_id, 'DOC-20261102-TEST02');
      assert.equal(res.ocr_pages_count, 1);
      assert.equal(res.pages[0].extraction_method, 'ocr');
      assert.equal(res.pages[0].ocr_applied, true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
