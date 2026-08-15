from application.conversion_service import ConversionService


class CLI:
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RESET = "\033[0m"

    def __init__(self):
        self.service = ConversionService()

    def render_exploration(self, base: int):
        print(f"\n{self.CYAN}--- Explorando la Estructura de la Base {base} ---{self.RESET}")
        print("Mostrando transiciones clave (cuándo se añade una nueva posición):\n")

        structure = self.service.explore_base(base)
        for row in structure:
            if row["is_gap"]:
                print("  ...")
                continue

            if row["is_power"]:
                print(
                    f"{self.YELLOW}  Decimal: {row['decimal']:<8}  -->  Base {base}: {row['base_repr']:>12}  [POTENCIA {base}^{row['power_idx']}]{self.RESET}")
            else:
                print(f"  Decimal: {row['decimal']:<8}  -->  Base {base}: {row['base_repr']:>12}")

    def render_conversion(self, report: dict):
        number = report["number"]
        target_base = report["target_base"]

        print(f"\nConvirtiendo {number.value} (Base {number.base}) a Base {target_base}...")

        # MÉTOD0 1: Potencias
        print(f"\n{self.CYAN}--- MÉTODO 1: Descomposición por Potencias (Llevar a Base 10) ---{self.RESET}")
        powers_data = report["powers_method"]
        formula = []
        sum_strs = []

        for term in powers_data["terms"]:
            print(
                f"  • Posición {term['position']}: Dígito '{term['character']}' ({term['digit_value']}) x {number.base}^{term['position']} = {self.GREEN}{term['subtotal']}{self.RESET}")
            formula.append(f"({term['digit_value']} × {number.base}^{term['position']})")
            sum_strs.append(str(term['subtotal']))

        print(f"\n  Fórmula: " + " + ".join(formula))
        print(f"  Suma:    " + " + ".join(
            sum_strs) + f" = {self.YELLOW}{powers_data['decimal_total']}{self.RESET} (Decimal)")

        # MÉTOD0 2: Divisiones Sucesivas
        print(f"\n{self.CYAN}--- MÉTODO 2: Divisiones Sucesivas (Llevar a Base {target_base}) ---{self.RESET}")
        divisions_data = report["divisions_method"]
        if not divisions_data["steps"]:
            print("El número es 0, resultado directo: 0.")
        else:
            print(f"{'Paso':<6} | {'División':<16} | {'Cociente':<10} | {'Residuo':<10} | {'Símbolo':<8}")
            print("-" * 62)
            for step in divisions_data["steps"]:
                print(
                    f"{step['step']:<6} | {step['dividend']:<5} ÷ {step['divisor']:<8} | {step['quotient']:<10} | {step['remainder']:<10} | {self.GREEN}{step['symbol']}{self.RESET}")
            print("-" * 62)
            print(
                f"  Lectura de residuos (abajo hacia arriba): {self.YELLOW}{' '.join(divisions_data['reversed_remainders'])}{self.RESET}")

        # MÉTOD0 3: Agrupación
        print(f"\n{self.CYAN}--- MÉTODO 3: Conversión por Agrupación (Atajo Directo) ---{self.RESET}")
        grouping_data = report["grouping_method"]
        if grouping_data["applicable"]:
            print(
                f"¡Atajo disponible! Podemos {'agrupar' if grouping_data['type'] == 'agrupacion' else 'expandir'} en bloques de {grouping_data['size']} bits:\n")
            if grouping_data["type"] == "agrupacion":
                print("  1. Bloques: " + " | ".join([b["original"] for b in grouping_data["blocks"]]))
                print("  2. Traducción:")
                for block in grouping_data["blocks"]:
                    print(f"     • {block['original']} -> {self.GREEN}{block['converted']}{self.RESET}")
            else:
                for block in grouping_data["blocks"]:
                    print(f"  • {block['original']} -> {self.GREEN}{block['converted']}{self.RESET}")
        else:
            print(
                f"  {self.YELLOW}Nota Pedagógica:{self.RESET} Este método NO aplica para pasar de Base {number.base} a Base {target_base}.")

        # RESULTADO FINAL
        print(f"\n{self.YELLOW}======================================================={self.RESET}")
        print(
            f" RESULTADO FINAL: {number.value} (Base {number.base}) = {self.GREEN}{report['final_result']}{self.YELLOW} (Base {target_base})")
        print(f"{self.YELLOW}======================================================={self.RESET}\n")

    def run(self):
        print(f"{self.YELLOW}=== BIENVENIDO AL MOTOR DIDÁCTICO DE BASES ==={self.RESET}")
        try:
            working_base = int(input("\n1. ¿Qué sistema numérico deseas explorar? (Ingresa la base, ej. 2, 3, 16): "))
            self.render_exploration(working_base)
        except ValueError:
            print(f"{self.YELLOW}Por favor, ingresa un número válido.{self.RESET}")
            return

        print(f"\n{self.YELLOW}=== CONVERSOR UNIVERSAL PASO A PASO ==={self.RESET}")
        try:
            num_val = input("Ingresa el número que deseas convertir: ").strip()
            source_base = int(input("¿En qué base está ese número?: "))
            target_base = int(input("¿A qué base deseas convertirlo?: "))

            report = self.service.process_full_conversion(num_val, source_base, target_base)
            self.render_conversion(report)

        except ValueError as e:
            print(f"\n{self.YELLOW}¡ERROR!{self.RESET} {str(e)}")