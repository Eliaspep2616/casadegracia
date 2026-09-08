import { Navigate } from 'react-router-dom';

const RutaProtegida = ({ children, usuarioAutenticado, rolRequerido, rolUsuario, cargando }) => {
  
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9f7f2]">
        <div className="w-12 h-12 border-4 border-[#eaeaea] border-t-[#1a1a1a] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!usuarioAutenticado) {
    return <Navigate to="/Academia-lideres" replace />;
  }

  if (rolRequerido && rolUsuario !== rolRequerido) {
    return <Navigate to={rolUsuario === 'profesor' ? '/admin-academico' : '/portal-estudiante'} replace />;
  }

  return children;
};

export default RutaProtegida;