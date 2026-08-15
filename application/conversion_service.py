from domain.number import Number
from domain.converter import Converter


class ConversionService:

    def explore_base(self, base: int, limit: int = 10) -> list:
        return Converter.get_base_structure(base, limit)

    def process_full_conversion(self, value: str, source_base: int, target_base: int) -> dict:
        # 1. Validate and create the entity
        number = Number(value, source_base)

        # 2. Power decomposition (to base 10)
        powers_data = Converter.get_powers_decomposition(number)
        decimal_val = powers_data["decimal_total"]

        # 3. Successive divisions (to target base)
        divisions_data = Converter.get_successive_divisions(decimal_val, target_base)

        # 4. Shortcut verification (grouping)
        grouping_data = Converter.get_grouping_conversion(number, target_base)

        return {
            "number": number,
            "target_base": target_base,
            "powers_method": powers_data,
            "divisions_method": divisions_data,
            "grouping_method": grouping_data,
            "final_result": divisions_data["result"]
        }