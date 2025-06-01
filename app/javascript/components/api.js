export const apiFetch = async (url, options = {}) => {
  // ① 通常のfetch
  // ② 401エラーならrefresh_token使って再発行を試みる
  // ③ 成功すれば再リクエスト、失敗ならエラー返却
  const response = await fetch(url, {
    credentials: 'include',
    ...options,
  });

  // アクセストークンの期限切れなどで401ならリフレッシュトライ
  if (response.status === 401) {
    const refreshRes = await fetch('/api/refresh_token', {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshRes.ok) {
    const data = await refreshRes.json();
      console.log('🔁 Refresh token response:', data);
      // 再リクエスト
      return fetch(url, {
        credentials: 'include',
        ...options,
      });
    } else {
      throw new Error('Token refresh failed');
    }
  }

  return response;
};
