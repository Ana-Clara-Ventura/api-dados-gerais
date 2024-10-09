import Amazon from '../model/Amazon';
import { DatabaseModel } from '../model/DatabaseModel';

// Jest.mock para o DatabaseModel
jest.mock('../model/DatabaseModel', () => {
    // Definir o mockQuery dentro do mock
    const mockQuery = jest.fn(); // Mock da função query
    return {
        DatabaseModel: jest.fn().mockImplementation(() => ({
            pool: {
                query: mockQuery, // Atribuindo o mockQuery à função query
            },
        })),
        mockQuery, // Exportar o mockQuery para ser usado nos testes
    };
});

describe('Amazon', () => {
    const mockDatabase = new DatabaseModel().pool;

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('listarVendaLivros', () => {
        it('deve retornar uma lista de livros em caso de sucesso', async () => {
            const mockResult = {
                rows: [
                    {
                        id_livro: 1,
                        data_venda: '2020-07-31T03:00:00.000Z',
                        rank_venda: 2,
                        nome_produto: 'As Crônicas de Nárnia. Brochura',
                        estrelas: null,
                        reviews: null,
                        autores: null,
                        edicao: 'Capa comum',
                        preco_padrao_min: 26.9,
                        preco_max: null,
                    },
                ],
            };
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockResult); // Aqui estamos definindo o comportamento esperado

            const result = await Amazon.listarVendaLivros();
            expect(result).toEqual(mockResult.rows);
        });

        it('deve retornar uma mensagem de erro em caso de falha', async () => {
            (mockDatabase.query as jest.Mock).mockRejectedValue(new Error('Database error'));

            const result = await Amazon.listarVendaLivros();
            expect(result).toBe('error, verifique os logs do servidor');
        });
    });

    describe('removerVenda', () => {
        it('deve retornar true quando a venda for removida com sucesso', async () => {
            const mockDeleteResult = { rowCount: 1 };
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockDeleteResult); // Mock de resultado de sucesso

            const result = await Amazon.removerVenda(1);
            expect(result).toBe(true);
        });

        it('deve retornar false quando não houver venda para remover', async () => {
            const mockDeleteResult = { rowCount: 0 };
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockDeleteResult); // Mock de resultado quando não existe venda

            const result = await Amazon.removerVenda(2);
            expect(result).toBe(false);
        });

        it('deve retornar false e capturar erro em caso de falha', async () => {
            (mockDatabase.query as jest.Mock).mockRejectedValue(new Error('Delete error'));

            const result = await Amazon.removerVenda(1);
            expect(result).toBe(false);
        });
    });
});
