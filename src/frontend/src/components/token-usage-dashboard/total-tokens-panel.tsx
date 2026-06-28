'use client'

import { TotalPanelModel } from '@/types/token-usage'

interface TotalTokensPanelProps {
  model: TotalPanelModel
}

export default function TotalTokensPanel({ model }: TotalTokensPanelProps) {
  function renderBody() {
    switch (model.state) {
      case 'loading':
        return <div className="loading-spinner">Loading...</div>

      case 'error':
        return <div className="error-state">{model.errorMessage}</div>

      case 'zero':
        return <div className="total-value">0</div>

      case 'success':
        return (
          <div className="total-value">
            {model.totalTokens.toLocaleString()}
          </div>
        )
    }
  }

  return (
    <div className="panel">
      <div className="panel-title">Total Tokens</div>
      <div className="panel-body">{renderBody()}</div>
      {model.state === 'success' && !model.isComplete && (
        <div className="incomplete-badge">Incomplete data</div>
      )}
    </div>
  )
}
