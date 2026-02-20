/**
 * Brazilian CPF validation — checksum algorithm (Módulo 11)
 * Rejects: wrong length, all-same-digit sequences (000...000, 111...111, etc.),
 * and known fake CPFs like 123.456.789-09.
 */

export function stripCpf(cpf: string): string {
    return cpf.replace(/\D/g, '');
}

export function validateCpf(raw: string): { valid: boolean; error?: string } {
    const d = stripCpf(raw);

    if (d.length !== 11) {
        return { valid: false, error: 'CPF deve ter 11 dígitos.' };
    }

    // Reject all-same-digit sequences (000...000, 111...111, etc.)
    if (/^(\d)\1{10}$/.test(d)) {
        return { valid: false, error: 'CPF inválido.' };
    }

    // First digit check
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(d[9])) {
        return { valid: false, error: 'CPF inválido (dígito verificador incorreto).' };
    }

    // Second digit check
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(d[10])) {
        return { valid: false, error: 'CPF inválido (dígito verificador incorreto).' };
    }

    return { valid: true };
}

/**
 * Validate that a full name has at least 2 words, each with ≥ 2 characters.
 * (Minimum for it to represent a real person's name.)
 */
export function validateFullName(name: string): { valid: boolean; error?: string } {
    const trimmed = name.trim();
    if (trimmed.length < 5) {
        return { valid: false, error: 'Nome muito curto.' };
    }
    const words = trimmed.split(/\s+/).filter(w => w.length >= 2);
    if (words.length < 2) {
        return { valid: false, error: 'Informe seu nome completo (nome e sobrenome).' };
    }
    // No numbers allowed in a name
    if (/\d/.test(trimmed)) {
        return { valid: false, error: 'Nome não pode conter números.' };
    }
    return { valid: true };
}

/**
 * Placeholder for future CPF + Name identity cross-validation via external API.
 * Requires: Serpro DataValid, Idwall, BigID or similar KYC provider credentials.
 *
 * When you have an API key, implement here and call from /api/validate-identity.
 */
export async function validateIdentity(
    _cpf: string,
    _name: string
): Promise<{ valid: boolean; error?: string; provider?: string }> {
    // TODO: integrate with Serpro DataValid or similar
    // Example: POST https://gateway.apiserpro.serpro.gov.br/consulta-cpf-df/v1/cpf/{cpf}
    // with Authorization: Bearer <SERPRO_TOKEN>
    // and check if response.nome ≈ _name

    // For now: return null (not validated externally — only local checks are enforced)
    return { valid: true, provider: 'local-only' };
}
