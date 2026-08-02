// Helper for instant account creation, 32-character recovery code generation, persistent session memory, and myacc.txt download

export interface AccountPayload {
  id: string;
  role: 'client' | 'firma';
  email: string;
  password?: string;
  companyName?: string;
  nip?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  recoveryCode: string;
}

export function generate32CharRecoveryCode(): string {
  const chars = 'ABCDEF0123456789';
  let code = '';
  for (let i = 0; i < 32; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function downloadMyAccFile(payload: AccountPayload) {
  const fileContent = `====================================================
LOKALNIE PRO - DANE DOSTĘPOWE I KOD ODZYSKIWANIA KONTA
====================================================
Identyfikator Konta: ${payload.id}
Typ Konta: ${payload.role === 'firma' ? 'KONTO FIRMOWE (ZWERFIKOWANE)' : 'KONTO PRYWATNE'}
Login / Klucz Dostępny: ${payload.email}
Hasło Dostępowe: ${payload.password || 'Dostęp bezhasłowy (Klucz Szybki)'}
${payload.nip ? `NIP Firmy: ${payload.nip}\nNazwa Firmy: ${payload.companyName}\nAdres Główny (GUS): ${payload.address || 'Zarejestrowana siedziba'}, ${payload.city || 'Polska'}` : ''}

----------------------------------------------------
32-ZNAKOWY UNIKALNY KOD ODZYSKIWANIA KONTA:
${payload.recoveryCode}
----------------------------------------------------
UWAGA: Przechowuj ten plik (myacc.txt) w bezpiecznym miejscu!
Kod odzyskiwania generowany jest tylko raz podczas tworzenia konta.
W przypadku utraty dostępu użyj tego kodu w zakładce odzyskiwania.
====================================================`;

  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'myacc.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function createInstantAccount(role: 'client' | 'firma', companyDetails?: { nip: string; companyName: string; address?: string; city?: string; postalCode?: string }) {
  const recoveryCode = generate32CharRecoveryCode();
  const rawId = Math.floor(100000 + Math.random() * 900000);
  const accountId = role === 'firma' ? `FIRMA-${companyDetails?.nip || rawId}` : `ACC-${rawId}`;
  
  const generatedEmail = role === 'firma' 
    ? `firma.${companyDetails?.nip || rawId}@lokalnie.pro`
    : `klient.${rawId}@lokalnie.pro`;
    
  const generatedPassword = `Pass#${Math.floor(100000 + Math.random() * 900000)}`;

  const payload: AccountPayload = {
    id: accountId,
    role,
    email: generatedEmail,
    password: generatedPassword,
    companyName: companyDetails?.companyName,
    nip: companyDetails?.nip,
    address: companyDetails?.address,
    city: companyDetails?.city,
    postalCode: companyDetails?.postalCode,
    recoveryCode
  };

  // 1. Save to MySQL database
  try {
    if (role === 'firma') {
      await fetch('/api/mysql/companies/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: accountId,
          company_name: companyDetails?.companyName || 'Nowa Firma',
          nip: companyDetails?.nip || '',
          address: companyDetails?.address || '',
          city: companyDetails?.city || '',
          email: generatedEmail,
          visibility_package: 'free'
        })
      });
    } else {
      await fetch('/api/mysql/users/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: accountId,
          email: generatedEmail,
          name: 'Konto Prywatne',
          role: 'client',
          status: 'active'
        })
      });
    }
  } catch (e) {
    console.warn('MySQL account creation note:', e);
  }

  // 2. Persistent session memory & recovery code storage
  localStorage.setItem('active_user_session', JSON.stringify({
    uid: accountId,
    email: generatedEmail,
    role,
    name: companyDetails?.companyName || 'Konto Prywatne',
    companyName: companyDetails?.companyName || ''
  }));

  localStorage.setItem('user_role_' + accountId, role);
  if (role === 'firma') {
    localStorage.setItem('has_company_profile_' + accountId, 'true');
  }
  localStorage.setItem('recovery_code_' + accountId, recoveryCode);
  localStorage.setItem('recovery_code_' + generatedEmail, recoveryCode);

  // 3. Automatically download myacc.txt file
  downloadMyAccFile(payload);

  return payload;
}
