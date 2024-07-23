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
            with open("config/cards.json", "r") as f:
                self.card_data = json.load(f)
        except FileNotFoundError:
            self.card_data = []

        try:
            with open("config/tags.json", "r") as f:
                self.tag_data = json.load(f)
        except FileNotFoundError:
            self.tag_data = {}

    def save_data(self):
        with open("config/cards.json", "w") as f:
            json.dump(self.card_data, f, indent=2)
        with open("config/tags.json", "w") as f:
            json.dump(self.tag_data, f, indent=2)
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
    def __init__(self, parent, card):
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

        tk.Label(self.top, text="Description:").pack()
        self.desc_entry = tk.Entry(self.top)
        self.desc_entry.pack()
        if card:
            self.desc_entry.insert(0, card["description"])

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
            "description": self.desc_entry.get(),
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
    def __init__(self, parent, choice):
        self.choice = choice
        self.top = tk.Toplevel(parent)
        self.top.title("Edit Choice")

        tk.Label(self.top, text="Text:").pack()
        self.text_entry = tk.Entry(self.top)
        self.text_entry.pack()
        if choice:
            self.text_entry.insert(0, choice["text"])

        tk.Label(self.top, text="Effect:").pack()
        self.effect_entry = tk.Entry(self.top)
        self.effect_entry.pack()
        if choice:
            self.effect_entry.insert(0, choice["effect"])

        tk.Button(self.top, text="Save", command=self.save).pack()

    def save(self):
        self.choice = {
            "text": self.text_entry.get(),
            "effect": self.effect_entry.get()
        }
        self.top.destroy()

if __name__ == "__main__":
    app = CardEditor()
    app.mainloop()