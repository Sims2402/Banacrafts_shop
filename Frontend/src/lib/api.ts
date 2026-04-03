const BASE_URL = "http://localhost:5000/api";

export const fetchWithAuth = async (
  endpoint: string,
  options: any = {}
) => {

  const storedUser = localStorage.getItem("banacrafts_user");
  const token = storedUser ? JSON.parse(storedUser).token : null;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error("API request failed");
  }

  return res.json();
};
