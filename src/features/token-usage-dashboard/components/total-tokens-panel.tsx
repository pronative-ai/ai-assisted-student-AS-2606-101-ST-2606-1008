import type { TotalTokensPanelModel } from '../models/token-usage-types';

interface TotalTokensPanelProps {
  model: TotalTokensPanelModel;
}

export default function TotalTokensPanel({ model }: TotalTokensPanelProps) {
  return (
    <div className="panel panel-total-tokens">
      <h2 className="panel-title">Total Tokens</h2>

      <div className="panel-body">
        {model.errorState === 'loading' && (
          <p className="panel-status">Loading...</p>
        )}

        {model.errorState === 'error' && (
          <p className="panel-status panel-status-error">
            Unable to load total tokens.
          </p>
        )}

        {model.errorState !== 'loading' && model.errorState !== 'error' && (
          <>
            <p className="panel-value">
              {model.totalTokens.toLocaleString()}
            </p>
            {model.errorState === 'incomplete' && (
              <p className="panel-incomplete">
                Data incomplete — showing available values.
              </p>
            )}
            {!model.isComplete && model.errorState !== 'incomplete' && (
              <p className="panel-incomplete">
                Data incomplete — showing available values.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
