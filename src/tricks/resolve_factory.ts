
export function resolveFactory(raw: AnyObject | AnyFactory): AnyObject | AnyFactory {
    if (typeof raw === 'function') return raw; 
    return () => raw;
}


export function resolveVaultFactory(raw: AnyFactory): AnyFactory {
    if (typeof raw === 'function') return raw;
    return () => raw;
}


export function resolveAnyFactory(raw: AnyType): AnyFactory { 
  if (typeof raw === 'function')return raw as AnyFactory;
  return () => raw;
}



