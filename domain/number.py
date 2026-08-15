class Number:
    SYMBOLS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"

    def __init__(self, value: str, base: int):
        self.base = base
        self.value = value.strip().upper()
        self._validate()

    def _validate(self):
        if not (2 <= self.base <= 36):
            raise ValueError(f"La base {self.base} no está soportada (debe estar entre 2 y 36).")

        permitted_symbols = self.SYMBOLS[:self.base]
        for character in self.value:
            if character not in permitted_symbols:
                raise ValueError(
                    f"El símbolo '{character}' NO existe en la Base {self.base}. "
                    f"Símbolos válidos: {permitted_symbols}"
                )