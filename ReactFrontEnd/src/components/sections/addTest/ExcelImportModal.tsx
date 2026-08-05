import type { FC } from 'react';
import type { FullIELTSParseResult } from '@/services/excelService';

interface ExcelImportModalProps {
  isOpen: boolean;
  parseResult: FullIELTSParseResult | null;
  onClose: () => void;
  onConfirmImport: (mode: 'overwrite' | 'merge') => void;
}

export const ExcelImportModal: FC<ExcelImportModalProps> = ({
  isOpen,
  parseResult,
  onClose,
  onConfirmImport,
}) => {
  if (!isOpen || !parseResult) return null;

  const { isValid, errors, warnings, data } = parseResult;

  // Count parsed items
  let listeningCount = 0;
  if (data.listening) {
    Object.values(data.listening).forEach((sections) => {
      sections.forEach((sec) => (listeningCount += sec.questions.length));
    });
  }

  let readingCount = 0;
  if (data.reading?.sections) {
    Object.values(data.reading.sections).forEach((sections) => {
      sections.forEach((sec) => (readingCount += sec.questions.length));
    });
  }

  const writingCount = data.writing?.length || 0;
  const speakingCount =
    (data.speaking?.[0]?.questions?.length || 0) +
    (data.speaking?.[1]?.cueCard?.topic ? 1 : 0) +
    (data.speaking?.[2]?.questions?.length || 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
          <h3 className="text-2xl font-bold font-sans">Import Excel Preview & Validation</h3>
          <p className="text-blue-100 text-sm mt-1 font-sans">
            Review parsed test content and any data formatting errors before updating the test form.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Summary Badges */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Parsed Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <span className="block text-2xl font-bold text-blue-700">{listeningCount}</span>
                <span className="text-xs text-blue-600 font-medium">Listening Qs</span>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                <span className="block text-2xl font-bold text-red-700">{readingCount}</span>
                <span className="text-xs text-red-600 font-medium">Reading Qs</span>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <span className="block text-2xl font-bold text-green-700">{writingCount}</span>
                <span className="text-xs text-green-600 font-medium">Writing Tasks</span>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                <span className="block text-2xl font-bold text-purple-700">{speakingCount}</span>
                <span className="text-xs text-purple-600 font-medium">Speaking Parts</span>
              </div>
            </div>
          </div>

          {/* Test General Info parsed */}
          {data.title && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-sans">
              <p className="font-semibold text-gray-800">Title: <span className="font-normal">{data.title}</span></p>
              {data.tags && data.tags.length > 0 && (
                <p className="font-semibold text-gray-800 mt-1">
                  Tags: <span className="font-normal">{data.tags.join(', ')}</span>
                </p>
              )}
            </div>
          )}

          {/* Critical Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm font-sans">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                ❌ Critical Errors ({errors.length})
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-red-700 text-xs">
                {errors.map((err, idx) => (
                  <li key={`err-${idx}`}>
                    <span className="font-semibold">[{err.sheet}] Row {err.row}</span> - {err.field}: {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm font-sans">
              <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                ⚠️ Warnings & Duplicate Alerts ({warnings.length})
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-amber-700 text-xs">
                {warnings.map((warn, idx) => (
                  <li key={`warn-${idx}`}>
                    <span className="font-semibold">[{warn.sheet}] Row {warn.row}</span> - {warn.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isValid && (
            <div className="text-sm text-red-600 bg-red-100 p-3 rounded-lg font-medium text-center">
              Cannot import file due to critical errors above. Please fix the Excel file and try again.
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-3 justify-end items-center">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-200 font-medium text-sm transition-all"
          >
            Cancel
          </button>

          {isValid && (
            <>
              <button
                onClick={() => onConfirmImport('merge')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm"
              >
                🔀 Merge Data
              </button>

              <button
                onClick={() => onConfirmImport('overwrite')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm"
              >
                🔄 Overwrite All
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
