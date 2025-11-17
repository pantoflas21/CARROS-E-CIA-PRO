-- Seed Demo Data for Seminovo

-- Insert demo clients
INSERT INTO public.clients (cpf, full_name, email, phone, birth_date, address, city, state, zip_code, nationality, profession, marital_status)
VALUES
  ('12345678900', 'João Silva', 'joao@email.com', '(11) 99999-0001', '1990-01-01', 'Rua A, 123', 'São Paulo', 'SP', '01234-567', 'Brasileiro', 'Engenheiro', 'Casado'),
  ('98765432100', 'Maria Santos', 'maria@email.com', '(11) 99999-0002', '1985-05-15', 'Avenida B, 456', 'Rio de Janeiro', 'RJ', '20000-000', 'Brasileira', 'Médica', 'Solteira'),
  ('11122233344', 'Pedro Costa', 'pedro@email.com', '(11) 99999-0003', '1992-03-20', 'Rua C, 789', 'Belo Horizonte', 'MG', '30120-000', 'Brasileiro', 'Advogado', 'Divorciado');

-- Insert demo vehicles
INSERT INTO public.vehicles (brand, model, year, color, fuel_type, transmission, mileage, price, status, license_plate, vehicle_type, created_by)
SELECT
  'Toyota', 'Corolla', 2020, 'Prata', 'Gasolina', 'Automático', 45000, 85000.00, 'available', 'ABC-1234',  'carro', auth.users.id
FROM auth.users LIMIT 1;

INSERT INTO public.vehicles (brand, model, year, color, fuel_type, transmission, mileage, price, status, license_plate, vehicle_type, created_by)
SELECT
  'Honda', 'Civic', 2019, 'Branco', 'Gasolina', 'Automático', 60000, 95000.00, 'available', 'DEF-5678', 'carro', auth.users.id
FROM auth.users LIMIT 1;

INSERT INTO public.vehicles (brand, model, year, color, fuel_type, transmission, mileage, price, status, license_plate, vehicle_type, created_by)
SELECT
  'Ford', 'Fiesta', 2018, 'Vermelho', 'Gasolina', 'Manual', 80000, 60000.00, 'available', 'GHI-9012', 'carro', auth.users.id
FROM auth.users LIMIT 1;

INSERT INTO public.vehicles (brand, model, year, color, fuel_type, transmission, mileage, price, status, license_plate, vehicle_type, created_by)
SELECT
  'Yamaha', 'XJ6', 2021, 'Azul', 'Gasolina', 'Manual', 15000, 28000.00, 'available', 'JKL-3456', 'moto', auth.users.id
FROM auth.users LIMIT 1;

INSERT INTO public.vehicles (brand, model, year, color, fuel_type, transmission, mileage, price, status, license_plate, vehicle_type, created_by)
SELECT
  'Honda', 'CB 500', 2020, 'Preto', 'Gasolina', 'Manual', 20000, 32000.00, 'available', 'MNO-7890', 'moto', auth.users.id
FROM auth.users LIMIT 1;
