import json
import tkinter as tk
from tkinter import simpledialog, messagebox

class CardEditor(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Card Editor")
        self.geometry("600x500")
        self.card_data = []
        self.tag_data = {}

        self.load_data()
        self.create_widgets()

    def load_data(self):
        try:
            with open("config/cards.json", "r", encoding='utf-8') as f:
                self.card_data = json.load(f)
        except FileNotFoundError:
            self.card_data = []

        try:
            with open("config/tagsConfig.json", "r", encoding='utf-8') as f:
                self.tag_data = json.load(f)
        except FileNotFoundError:
            self.tag_data = {}

    def save_data(self):
        with open("config/cards.json", "w", encoding='utf-8-sig') as f:
            json.dump(self.card_data, f, indent=2, ensure_ascii=False)
        with open("config/tagsConfig.json", "w", encoding='utf-8-sig') as f:
            json.dump(self.tag_data, f, indent=2, ensure_ascii=False)
        messagebox.showinfo("Save", "Data saved successfully")

    def create_widgets(self):
        self.card_listbox = tk.Listbox(self)
        self.card_listbox.pack(fill=tk.BOTH, expand=True)
        self.load_cards_to_listbox()

        btn_frame = tk.Frame(self)
        btn_frame.pack(fill=tk.X)

        add_card_btn = tk.Button(btn_frame, text="Add Card", command=self.add_card)
        add_card_btn.pack(side=tk.LEFT, fill=tk.X, expand=True)

        edit_card_btn = tk.Button(btn_frame, text="Edit Card", command=self.edit_card)
        edit_card_btn.pack(side=tk.LEFT, fill=tk.X, expand=True)

        save_btn = tk.Button(btn_frame, text="Save", command=self.save_data)
        save_btn.pack(side=tk.LEFT, fill=tk.X, expand=True)

    def load_cards_to_listbox(self):
        self.card_listbox.delete(0, tk.END)
        for card in self.card_data:
            self.card_listbox.insert(tk.END, card["name"])

    def add_card(self):
        card = self.edit_card_dialog()
        if card:
            self.card_data.append(card)
            self.load_cards_to_listbox()

    def edit_card(self):
        selected = self.card_listbox.curselection()
        if selected:
            index = selected[0]
            card = self.edit_card_dialog(self.card_data[index])
            if card:
                self.card_data[index] = card
                self.load_cards_to_listbox()

    def edit_card_dialog(self, card=None):
        dialog = CardDialog(self, card)
        self.wait_window(dialog.top)
        return dialog.card

class CardDialog:
    def __init__(self, parent, card=None):
        self.card = card
        self.top = tk.Toplevel(parent)
        self.top.title("Edit Card")

        tk.Label(self.top, text="ID:").pack()
        self.id_entry = tk.Entry(self.top)
        self.id_entry.pack()
        if card:
            self.id_entry.insert(0, card["id"])

        tk.Label(self.top, text="Name:").pack()
        self.name_entry = tk.Entry(self.top)
        self.name_entry.pack()
        if card:
            self.name_entry.insert(0, card["name"])

        tk.Label(self.top, text="Type:").pack()
        self.type_entry = tk.Entry(self.top)
        self.type_entry.pack()
        if card:
            self.type_entry.insert(0, card["type"])

        tk.Label(self.top, text="Card Set:").pack()
        self.card_set_entry = tk.Entry(self.top)
        self.card_set_entry.pack()
        if card:
            self.card_set_entry.insert(0, card["cardSet"])

        tk.Label(self.top, text="Description:").pack()
        self.desc_entry = tk.Entry(self.top)
        self.desc_entry.pack()
        if card:
            self.desc_entry.insert(0, card["description"])

        tk.Label(self.top, text="Base Weight:").pack()
        self.base_weight_entry = tk.Entry(self.top)
        self.base_weight_entry.pack()
        if card:
            self.base_weight_entry.insert(0, card.get("baseWeight", ""))

        tk.Label(self.top, text="Require Tags:").pack()
        self.require_tags_entry = tk.Entry(self.top)
        self.require_tags_entry.pack()
        if card:
            self.require_tags_entry.insert(0, json.dumps(card.get("requireTags", {})))

        tk.Label(self.top, text="Weight Multipliers:").pack()
        self.weight_multipliers_entry = tk.Entry(self.top)
        self.weight_multipliers_entry.pack()
        if card:
            self.weight_multipliers_entry.insert(0, json.dumps(card.get("weightMultipliers", {})))

        tk.Label(self.top, text="Must Draw:").pack()
        self.must_draw_var = tk.BooleanVar(value=card.get("mustDraw", False) if card else False)
        self.must_draw_check = tk.Checkbutton(self.top, variable=self.must_draw_var)
        self.must_draw_check.pack()

        tk.Label(self.top, text="Priority:").pack()
        self.priority_entry = tk.Entry(self.top)
        self.priority_entry.pack()
        if card:
            self.priority_entry.insert(0, card.get("priority", ""))

        tk.Label(self.top, text="Time Consumption:").pack()
        self.time_consumption_entry = tk.Entry(self.top)
        self.time_consumption_entry.pack()
        if card:
            self.time_consumption_entry.insert(0, card.get("timeConsumption", ""))

        tk.Label(self.top, text="Date Restrictions:").pack()
        self.date_restrictions_entry = tk.Entry(self.top)
        self.date_restrictions_entry.pack()
        if card:
            self.date_restrictions_entry.insert(0, json.dumps(card.get("dateRestrictions", {})))

        self.choices = card["choices"] if card else []
        tk.Button(self.top, text="Edit Choices", command=self.edit_choices).pack()

        tk.Button(self.top, text="Save", command=self.save).pack()

    def edit_choices(self):
        ChoicesDialog(self.top, self.choices)

    def save(self):
        self.card = {
            "id": self.id_entry.get(),
            "name": self.name_entry.get(),
            "type": self.type_entry.get(),
            "cardSet": self.card_set_entry.get(),
            "description": self.desc_entry.get(),
            "baseWeight": float(self.base_weight_entry.get()) if self.base_weight_entry.get() else 0.0,
            "requireTags": json.loads(self.require_tags_entry.get()) if self.require_tags_entry.get() else {},
            "weightMultipliers": json.loads(self.weight_multipliers_entry.get()) if self.weight_multipliers_entry.get() else {},
            "mustDraw": self.must_draw_var.get(),
            "priority": int(self.priority_entry.get()) if self.priority_entry.get() else 0,
            "timeConsumption": int(self.time_consumption_entry.get()) if self.time_consumption_entry.get() else 0,
            "dateRestrictions": json.loads(self.date_restrictions_entry.get()) if self.date_restrictions_entry.get() else {},
            "choices": self.choices
        }
        self.top.destroy()

class ChoicesDialog:
    def __init__(self, parent, choices):
        self.choices = choices
        self.top = tk.Toplevel(parent)
        self.top.title("Edit Choices")

        self.listbox = tk.Listbox(self.top)
        self.listbox.pack(fill=tk.BOTH, expand=True)
        for choice in self.choices:
            self.listbox.insert(tk.END, choice["text"])

        btn_frame = tk.Frame(self.top)
        btn_frame.pack(fill=tk.X)

        add_btn = tk.Button(btn_frame, text="Add Choice", command=self.add_choice)
        add_btn.pack(side=tk.LEFT, fill=tk.X, expand=True)

        edit_btn = tk.Button(btn_frame, text="Edit Choice", command=self.edit_choice)
        edit_btn.pack(side=tk.LEFT, fill=tk.X, expand=True)

        remove_btn = tk.Button(btn_frame, text="Remove Choice", command=self.remove_choice)
        remove_btn.pack(side=tk.LEFT, fill=tk.X, expand=True)

    def add_choice(self):
        choice = self.edit_choice_dialog()
        if choice:
            self.choices.append(choice)
            self.listbox.insert(tk.END, choice["text"])

    def edit_choice(self):
        selected = self.listbox.curselection()
        if selected:
            index = selected[0]
            choice = self.edit_choice_dialog(self.choices[index])
            if choice:
                self.choices[index] = choice
                self.listbox.delete(index)
                self.listbox.insert(index, choice["text"])

    def remove_choice(self):
        selected = self.listbox.curselection()
        if selected:
            index = selected[0]
            del self.choices[index]
            self.listbox.delete(index)

    def edit_choice_dialog(self, choice=None):
        dialog = ChoiceDialog(self.top, choice)
        self.top.wait_window(dialog.top)
        return dialog.choice

class ChoiceDialog:
    def __init__(self, parent, choice=None):
        self.choice = choice
        self.top = tk.Toplevel(parent)
        self.top.title("Edit Choice")

        tk.Label(self.top, text="Text:").pack()
        self.text_entry = tk.Entry(self.top)
        self.text_entry.pack()
        if choice:
            self.text_entry.insert(0, choice["text"])

        tk.Label(self.top, text="Description:").pack()
        self.desc_entry = tk.Entry(self.top)
        self.desc_entry.pack()
        if choice:
            self.desc_entry.insert(0, choice["description"])

        tk.Label(self.top, text="Conditions:").pack()
        self.conditions_entry = tk.Entry(self.top)
        self.conditions_entry.pack()
        if choice:
            self.conditions_entry.insert(0, json.dumps(choice.get("conditions", {})))

        tk.Label(self.top, text="Special Mechanism:").pack()
        self.special_mechanism_entry = tk.Entry(self.top)
        self.special_mechanism_entry.pack()
        if choice:
            self.special_mechanism_entry.insert(0, choice.get("specialMechanism", ""))

        tk.Label(self.top, text="Effects:").pack()
        self.effects_entry = tk.Entry(self.top)
        self.effects_entry.pack()
        if choice:
            self.effects_entry.insert(0, json.dumps(choice["effects"]))

        tk.Label(self.top, text="Consume Card:").pack()
        self.consume_card_var = tk.BooleanVar(value=choice.get("consumeCard", False) if choice else False)
        self.consume_card_check = tk.Checkbutton(self.top, variable=self.consume_card_var)
        self.consume_card_check.pack()

        tk.Button(self.top, text="Save", command=self.save).pack()

    def save(self):
        self.choice = {
            "text": self.text_entry.get(),
            "description": self.desc_entry.get(),
            "conditions": json.loads(self.conditions_entry.get()) if self.conditions_entry.get() else {},
            "specialMechanism": self.special_mechanism_entry.get(),
            "effects": json.loads(self.effects_entry.get()),
            "consumeCard": self.consume_card_var.get()
        }
        self.top.destroy()

if __name__ == "__main__":
    app = CardEditor()
    app.mainloop()