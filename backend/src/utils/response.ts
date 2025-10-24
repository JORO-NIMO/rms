export function ok(data: any = null, meta: any = null) {
  return { success: true, data, errors: null, meta };
}

export function fail(message: string, code: string = 'ERROR', status: number = 400, details: any = null) {
  return { success: false, data: null, errors: { message, code, status, details }, meta: null };
}
