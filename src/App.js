import React, { useState, useEffect } from 'react'; 
import { PlusCircle, Trash2 } from 'lucide-react';
import { supabase } from './supabase'; // Certifique-se de que esse caminho está correto
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinanceApp = () => {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactionsj') // Alterado para transactionsj
      .select('*')
      .order('date', { ascending: false });

    if (error) console.error('Error fetching transactions:', error);
    else setTransactions(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTransaction = {
      description,
      amount: type === 'expense' ? -Number(amount) : Number(amount),
      type,
      date: new Date().toISOString().split('T')[0],
    };

    const { error } = await supabase
      .from('transactionsj') // Alterado para transactionsj
      .insert([newTransaction]);

    if (error) {
      console.error('Error inserting transaction:', error);
    } else {
      // Atualiza o histórico de transações
      fetchTransactions();
      setDescription('');
      setAmount('');
      setType('expense');
    }
  };

  const deleteTransaction = async (id) => {
    const { error } = await supabase
      .from('transactionsj') // Alterado para transactionsj
      .delete()
      .match({ id });

    if (error) console.error('Error deleting transaction:', error);
    else fetchTransactions(); // Atualiza após a exclusão
  };

  const balance = transactions.reduce((acc, curr) => acc + curr.amount, 0);

  // Preparar dados para o gráfico
  const chartData = transactions.map(t => ({
    date: t.date,
    amount: t.amount,
  }));

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Finanças Pessoais</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-bold mb-4">Adicionar Transação</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              className="w-full p-2 border rounded"
              placeholder="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              type="number"
              className="w-full p-2 border rounded"
              placeholder="Valor"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <select
              className="w-full p-2 border rounded"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </select>
            <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded">
              <PlusCircle className="mr-2 inline" /> Adicionar
            </button>
          </form>
        </div>

        <div className="p-4 border rounded shadow">
          <h2 className="text-xl font-bold mb-4">Saldo Atual</h2>
          <p className={`text-4xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {balance.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-6 p-4 border rounded shadow">
        <h2 className="text-xl font-bold mb-4">Histórico de Transações</h2>
        <ul className="space-y-2">
          {transactions.map(t => (
            <li key={t.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
              <span>{t.description}</span>
              <span className={t.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                R$ {Math.abs(t.amount).toFixed(2)}
              </span>
              <button onClick={() => deleteTransaction(t.id)} className="text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 p-4 border rounded shadow">
        <h2 className="text-xl font-bold mb-4">Gráfico de Transações</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinanceApp;
