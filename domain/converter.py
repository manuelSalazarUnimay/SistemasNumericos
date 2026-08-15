from domain.number import Number

class Converter:

    @staticmethod
    def _decimal_to_simple_base(decimal_number: int, target_base: int) -> str:
        if decimal_number == 0:
            return "0"

        result = ""
        n = decimal_number

        while n > 0:
            remainder = n % target_base
            result = Number.SYMBOLS[remainder] + result
            n = n // target_base

        return result

    @staticmethod
    def get_base_structure(base: int, power_limit: int = 10) -> list:
        powers = [base ** i for i in range(1, power_limit + 1)]
        key_numbers = {0, 1}

        for p in powers:
            if p - 1 >= 0:
                key_numbers.add(p - 1)
            key_numbers.add(p)
            key_numbers.add(p + 1)

        sorted_numbers = sorted(list(key_numbers))
        structure = []
        last_num = -1

        for i in sorted_numbers:
            if last_num != -1 and (i - last_num) > 1:
                structure.append({"is_gap": True})

            base_repr = Converter._decimal_to_simple_base(i, base)
            is_power = i in powers

            structure.append({
                "is_gap": False,
                "decimal": i,
                "base_repr": base_repr,
                "is_power": is_power,
                "power_idx": powers.index(i) + 1 if is_power else None
            })
            last_num = i

        return structure

    @staticmethod
    def get_powers_decomposition(number: Number) -> dict:
        length = len(number.value)
        decimal_sum = 0
        terms = []

        for i, character in enumerate(number.value):
            power = length - 1 - i
            digit_value = Number.SYMBOLS.index(character)
            subtotal = digit_value * (number.base ** power)
            decimal_sum += subtotal

            terms.append({
                "position": power,
                "character": character,
                "digit_value": digit_value,
                "subtotal": subtotal
            })

        return {"terms": terms, "decimal_total": decimal_sum}

    @staticmethod
    def get_successive_divisions(decimal_num: int, target_base: int) -> dict:
        if decimal_num == 0:
            return {"steps": [], "result": "0"}

        steps = []
        n = decimal_num
        step_num = 1

        while n > 0:
            quotient = n // target_base
            remainder = n % target_base
            symbol = Number.SYMBOLS[remainder]

            steps.append({
                "step": step_num,
                "dividend": n,
                "divisor": target_base,
                "quotient": quotient,
                "remainder": remainder,
                "symbol": symbol
            })
            n = quotient
            step_num += 1

        reversed_remainders = [p["symbol"] for p in steps][::-1]

        return {
            "steps": steps,
            "reversed_remainders": reversed_remainders,
            "result": "".join(reversed_remainders)
        }

    @staticmethod
    def get_grouping_conversion(number: Number, target_base: int) -> dict:
        source_base = number.base
        num_str = number.value

        # Caso 1: Binario a Octal/Hexadecimal (Agrupación)
        if source_base == 2 and target_base in [8, 16]:
            size = 3 if target_base == 8 else 4
            padding = (size - (len(num_str) % size)) % size
            padded_num = "0" * padding + num_str
            groups = [padded_num[i:i + size] for i in range(0, len(padded_num), size)]

            blocks = [{"original": g, "converted": Number.SYMBOLS[int(g, 2)]} for g in groups]
            return {"applicable": True, "type": "agrupacion", "size": size, "blocks": blocks}

        # Caso 2: Octal/Hexadecimal a Binario (Expansión)
        elif source_base in [8, 16] and target_base == 2:
            size = 3 if source_base == 8 else 4
            blocks = [{"original": c, "converted": bin(Number.SYMBOLS.index(c))[2:].zfill(size)} for c in num_str]
            return {"applicable": True, "type": "expansion", "size": size, "blocks": blocks}

        # Caso 3: No aplicable
        return {"applicable": False}