import Netflix from '../model/Netflix';
import { DatabaseModel } from '../model/DatabaseModel';

// Mock do DatabaseModel
jest.mock('../model/DatabaseModel', () => {
    return {
        DatabaseModel: jest.fn().mockImplementation(() => ({
            pool: {
                query: jest.fn(), // Mock da função query
            },
        })),
    };
});

// Extração do mock da função query
const mockQuery = (new DatabaseModel().pool.query as jest.Mock);

describe('Netflix', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Limpar mocks após cada teste
    });

    describe('listarNetflixTitles', () => {
        it('deve retornar uma lista de títulos em caso de sucesso', async () => {
            const mockResult = {
                rows: [
                    {
                        show_id: 's1',
                        tipo: 'Movie',
                        titulo: 'Dick Johnson Is Dead',
                        diretor: 'Kirsten Johnson',
                        elenco: null,
                        pais: 'United States',
                        adicionado: 'September 25, 2021',
                        ano_lancamento: 2020,
                        classificacao: 'PG-13',
                        duracao: '90 min',
                        listado_em: 'Documentaries',
                        descricao: 'As her father nears the end of his life, filmmaker Kirsten Johnson stages his death in inventive and comical ways to help them both face the inevitable.',
                    },
                ],
            };

            // Mock para simular sucesso da query
            mockQuery.mockResolvedValueOnce(mockResult);

            // Chamada real da função a ser testada
            const result = await Netflix.listarNetflixTitles();

            // Verificação
            expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM netflix_titles;'); // Verifica se a query correta foi executada
            expect(result).toEqual(mockResult.rows); // Verifica o resultado da query
        });

        it('deve retornar uma mensagem de erro em caso de falha', async () => {
            // Mock para simular falha na query
            mockQuery.mockRejectedValueOnce(new Error('Database error'));

            const result = await Netflix.listarNetflixTitles();
            expect(result).toBe('error, verifique os logs do servidor');
        });
    });

    describe('removerNetflixTitle', () => {
        it('deve retornar true quando o título for removido com sucesso', async () => {
            const mockDeleteResult = { rowCount: 1 };

            // Mock para simular sucesso ao deletar o título
            mockQuery.mockResolvedValueOnce(mockDeleteResult);

            const result = await Netflix.removerNetflixTitle('s1');
            expect(mockQuery).toHaveBeenCalledWith(`DELETE FROM netflix_titles WHERE show_id='s1'`);
            expect(result).toBe(true);
        });

        it('deve retornar false quando não houver título para remover', async () => {
            const mockDeleteResult = { rowCount: 0 };

            // Mock para simular ausência de título para deletar
            mockQuery.mockResolvedValueOnce(mockDeleteResult);

            const result = await Netflix.removerNetflixTitle('s2');
            expect(mockQuery).toHaveBeenCalledWith(`DELETE FROM netflix_titles WHERE show_id='s2'`);
            expect(result).toBe(false);
        });

        it('deve retornar false e capturar erro em caso de falha', async () => {
            // Mock para simular falha ao tentar deletar
            mockQuery.mockRejectedValueOnce(new Error('Delete error'));

            const result = await Netflix.removerNetflixTitle('s1');
            expect(mockQuery).toHaveBeenCalledWith(`DELETE FROM netflix_titles WHERE show_id='s1'`);
            expect(result).toBe(false);
        });
    });
});
