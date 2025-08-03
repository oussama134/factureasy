
const API = 'http://localhost:5000/api/factures';

export const deleteFacture = (id) => axios.delete(`${API}/${id}`);

export const updateFacture = (id, updatedData) =>
  axios.put(`${API}/${id}`, updatedData);
