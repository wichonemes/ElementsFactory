import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Error en pantalla:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const message = String(error?.message || error || 'Error desconocido');
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 shadow-md p-5 space-y-3">
          <h2 className="text-base font-black text-rose-800">{this.props.title || 'Algo salió mal en esta pantalla'}</h2>
          <p className="text-xs text-gray-600">
            Tu información no se borró. Puedes volver a intentarlo o recargar la página.
          </p>
          <pre className="text-[11px] bg-stone-100 rounded-lg p-2.5 whitespace-pre-wrap break-words text-stone-700">{message}</pre>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="flex-1 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-700 cursor-pointer"
            >
              Volver a intentar
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex-1 py-2 rounded-xl bg-[#2D4F3E] text-white text-xs font-bold cursor-pointer"
            >
              Recargar
            </button>
          </div>
        </div>
      </div>
    );
  }
}
