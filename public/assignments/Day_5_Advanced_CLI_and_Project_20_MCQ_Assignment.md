# Super 60 // Skill Up 2026
## Day 5 : Advanced CLI & Project
### 20 Advanced C++ Multiple-Choice Questions (MCQs)

**Instructions:** Choose the correct answer from the four options given for each question.

---

### Question 1
In C++, which statement about a `switch` statement is correct?
- **A.** A `switch` statement can directly use any data type, including `float` and `string`.
- **B.** If `break` is missing, execution can continue into the next case.
- **C.** The `default` case must always be written first.
- **D.** A `switch` statement can contain only two cases.

---

### Question 2
What is the main difference between a `while` loop and a `do-while` loop in C++?
- **A.** A `while` loop always runs at least once.
- **B.** A `do-while` loop checks its condition before running.
- **C.** A `do-while` loop runs at least once before checking its condition.
- **D.** Both loops always run the same number of times.

---

### Question 3
A voting program allows a person to vote only if their age is at least 18 and their voter ID is valid. Which condition is correct?
- **A.** `if (age >= 18 || validID)`
- **B.** `if (age > 18 && !validID)`
- **C.** `if (age >= 18 && validID)`
- **D.** `if (age < 18 && validID)`

---

### Question 4
In a supermarket billing program, what is the correct way to calculate the total bill when each item has a different price and quantity?
- **A.** Add each item's quantity to the total bill.
- **B.** Add each item's price to the total bill only once.
- **C.** Multiply each item's price by its quantity and add the result to the total bill.
- **D.** Multiply the total bill by the number of items after every purchase.

---

### Question 5
Which statement about `break` and `continue` is correct in a loop?
- **A.** `break` skips only the current iteration, while `continue` ends the loop.
- **B.** `break` ends the loop, while `continue` skips the remaining statements in the current iteration.
- **C.** Both statements always end the loop.
- **D.** Both statements restart the program.

---

### Question 6
A toll plaza accepts vehicle types 1, 2 and 3. If the user enters another number, the program must show an error and must not change the total toll. Which approach is correct?
- **A.** Add the toll first and check the vehicle type afterward.
- **B.** Count every input as a valid vehicle.
- **C.** Use a `default` case to report invalid input without changing the toll or vehicle count.
- **D.** Ignore the vehicle type and add a fixed toll for every input.

---

### Question 7
Consider the following code:

```cpp
int i = 1, sum = 0;

while (i <= 6) {
    if (i % 2 == 0) {
        i++;
        continue;
    }

    sum += i;
    i++;
}

cout << sum;
```

What is the output?
- **A.** 12
- **B.** 9
- **C.** 16
- **D.** 21

---

### Question 8
What will be the output of the following C++ code?

```cpp
int x = 3, total = 0;

for (int i = 1; i <= 4; i++) {
    switch (i) {
        case 1:
            total += x;
            break;
        case 2:
            total *= 2;
            break;
        case 3:
            total += i * x;
        case 4:
            total -= 2;
            break;
    }
}

cout << total;
```

- **A.** 10
- **B.** 13
- **C.** 16
- **D.** 19

---

### Question 9
A cricket scoring program stores the runs scored on each ball. What will the following code print?

```cpp
int runs[] = {1, 4, 0, 2, 6, 0, 3};
int total = 0, scoringBalls = 0, dotBalls = 0;

for (int i = 0; i < 7; i++) {
    total += runs[i];

    if (runs[i] == 0)
        dotBalls++;
    else
        scoringBalls++;
}

cout << total << " " << scoringBalls << " " << dotBalls;
```

- **A.** `16 5 2`
- **B.** `16 7 2`
- **C.** `13 5 2`
- **D.** `16 2 5`

---

### Question 10
A shop has 25 items in stock. It receives requests to sell 8, 12, 9 and 5 items. A request is accepted only when enough stock is available. What will be the final stock and total number of items sold?

```cpp
int stock = 25, sold = 0;
int request[] = {8, 12, 9, 5};

for (int i = 0; i < 4; i++) {
    if (request[i] <= stock) {
        stock -= request[i];
        sold += request[i];
    }
}

cout << stock << " " << sold;
```

- **A.** `0 25`
- **B.** `5 20`
- **C.** `5 25`
- **D.** `0 30`

---

### Question 11
What is the output of this toll plaza program?

```cpp
int toll = 0, count = 0;
int vehicle[] = {1, 3, 2, 4, 1, 2};

for (int i = 0; i < 6; i++) {
    switch (vehicle[i]) {
        case 1:
            toll += 50;
            count++;
            break;
        case 2:
            toll += 100;
            count++;
            break;
        case 3:
            toll += 200;
            count++;
            break;
        default:
            continue;
    }
}

cout << toll << " " << count;
```

- **A.** `500 5`
- **B.** `550 6`
- **C.** `450 5`
- **D.** `500 6`

---

### Question 12
A supermarket gives a 12% discount when the subtotal is at least ₹8,000. After the discount, it charges 5% tax if the remaining amount is at least ₹5,000; otherwise, it charges 2% tax. What is the final bill for a subtotal of ₹10,000?

```cpp
double subtotal = 10000;
double discount = 0;

if (subtotal >= 8000)
    discount = subtotal * 0.12;

double amount = subtotal - discount;
double tax;

if (amount >= 5000)
    tax = amount * 0.05;
else
    tax = amount * 0.02;

cout << amount + tax;
```

- **A.** ₹10,000
- **B.** ₹9,240
- **C.** ₹9,240 exactly after discount and tax
- **D.** ₹9,240 is the discounted amount before tax

---

### Question 13
What will this nested-loop program print?

```cpp
int total = 0;

for (int i = 1; i <= 5; i++) {
    for (int j = 1; j <= 5; j++) {
        if (i + j > 6)
            break;

        total += i * j;
    }
}

cout << total;
```

- **A.** 70
- **B.** 85
- **C.** 95
- **D.** 105

---

### Question 14
An inventory system processes sales and restocking operations. What are the final values of `stock` and `sold`?

```cpp
int stock = 12, sold = 0;

int action[] = {1, 2, 1, 1, 2, 1};
int qty[] = {5, 7, 10, 4, 6, 3};

for (int i = 0; i < 6; i++) {
    switch (action[i]) {
        case 1:
            if (qty[i] <= stock) {
                stock -= qty[i];
                sold += qty[i];
            }
            break;

        case 2:
            stock += qty[i];
            break;
    }
}

cout << stock << " " << sold;
```

- **A.** `3 12`
- **B.** `7 12`
- **C.** `3 15`
- **D.** `9 12`

---

### Question 15
A voting machine has three candidates. Option 1 adds a vote to Candidate A, option 2 adds a vote to Candidate B, option 3 resets both candidates' votes, and every other input increases the invalid vote count. What is the final output?

```cpp
int A = 0, B = 0, invalid = 0;
int choice[] = {1, 2, 1, 4, 2, 3, 1, 5, 2, 4};

for (int i = 0; i < 10; i++) {
    switch (choice[i]) {
        case 1:
            A++;
            break;
        case 2:
            B++;
            break;
        case 3:
            A = 0;
            B = 0;
            break;
        default:
            invalid++;
    }
}

cout << A << " " << B << " " << invalid;
```

- **A.** `1 2 3`
- **B.** `2 2 2`
- **C.** `1 2 2`
- **D.** `3 2 3`

---

### Question 16
A cricket program uses the following rules: a wide adds one extra run but does not count as a legal ball, a wicket counts as a legal ball but adds no runs, and every other value is the number of runs scored from the bat. What is the output?

```cpp
int total = 0, legalBalls = 0, wickets = 0;
int event[] = {4, -1, 2, -2, 6, 1, -1, 3};

for (int i = 0; i < 8; i++) {
    if (event[i] == -1) {
        total++;
    }
    else if (event[i] == -2) {
        wickets++;
        legalBalls++;
    }
    else {
        total += event[i];
        legalBalls++;
    }
}

cout << total << " " << legalBalls << " " << wickets;
```

- **A.** `18 6 1`
- **B.** `18 7 1`
- **C.** `17 7 1`
- **D.** `18 8 2`

---

### Question 17
An inventory program starts with 20 items. A sale is accepted only if enough stock is available. Restocking adds items but does not count as a sale. Each item sold earns ₹35. What are the final stock and revenue?

```cpp
int stock = 20, revenue = 0;
int price = 35;

int action[] = {1, 2, 1, 1, 2, 1, 1};
int qty[] = {8, 6, 10, 5, 12, 7, 4};

for (int i = 0; i < 7; i++) {
    if (action[i] == 1) {
        if (qty[i] <= stock) {
            stock -= qty[i];
            revenue += qty[i] * price;
        }
    }
    else if (action[i] == 2) {
        stock += qty[i];
    }
}

cout << stock << " " << revenue;
```

- **A.** `4 840`
- **B.** `4 805`
- **C.** `7 840`
- **D.** `8 840`

---

### Question 18
A toll plaza has a collection limit of ₹500. A vehicle is accepted only if adding its toll does not exceed this limit. Vehicle types 1, 2 and 3 pay ₹50, ₹100 and ₹200. What is the final collection and number of accepted vehicles?

```cpp
int toll = 0, count = 0;
int vehicles[] = {3, 2, 1, 3, 2, 1};

for (int i = 0; i < 6; i++) {
    int fee = 0;

    switch (vehicles[i]) {
        case 1: fee = 50; break;
        case 2: fee = 100; break;
        case 3: fee = 200; break;
    }

    if (fee > 0 && toll + fee <= 500) {
        toll += fee;
        count++;
    }
}

cout << toll << " " << count;
```

- **A.** `500 4`
- **B.** `450 4`
- **C.** `500 5`
- **D.** `550 5`

---

### Question 19
A supermarket applies a 15% discount for bills of ₹10,000 or more. Members receive an extra ₹500 discount after the percentage discount. Tax is 5% of the amount after all discounts. What is the final bill?

```cpp
double subtotal = 15000;
bool member = true;

double discount = 0;

if (subtotal >= 10000)
    discount = subtotal * 0.15;
else if (subtotal >= 5000)
    discount = subtotal * 0.10;

if (member)
    discount += 500;

double amount = subtotal - discount;

if (amount < 0)
    amount = 0;

double tax = amount * 0.05;

cout << amount + tax;
```

- **A.** ₹12,075
- **B.** ₹12,600
- **C.** ₹12,337.50
- **D.** ₹13,125

---

### Question 20
A menu-driven inventory program uses option 1 to sell items, option 2 to restock items, option 3 to display stock and total items sold, and option 0 to stop. A sale is accepted only when enough stock is available. What is the complete output?

```cpp
int stock = 15, sold = 0;

int choice[] = {1, 2, 1, 3, 1, 2, 3, 0};
int qty[] = {7, 5, 8, 0, 4, 3, 0, 0};

int i = 0;

while (i < 8) {
    switch (choice[i]) {
        case 1:
            if (qty[i] <= stock) {
                stock -= qty[i];
                sold += qty[i];
            }
            break;

        case 2:
            stock += qty[i];
            break;

        case 3:
            cout << stock << ":" << sold << " ";
            break;

        case 0:
            i = 8;
            break;
    }

    i++;
}

cout << stock << " " << sold;
```

- **A.** `13:7 16:7 16 7`
- **B.** `13:7 16:7 16 10`
- **C.** `8:7 11:7 11 7`
- **D.** `13:7 16:10 16 10`
