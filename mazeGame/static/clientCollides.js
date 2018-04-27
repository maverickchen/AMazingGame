function collides(obj1, obj2) {
    // Add maze conflict here
    l1 = obj1.x;
    u1 = obj1.y;
    r1 = obj1.x + obj1.width;
    d1 = obj1.y + obj1.height;
    l2 = obj2.x;
    u2 = obj2.y;
    r2 = obj2.x + obj2.width;
    d2 = obj2.y + obj2.height;

    if (l1 > r2 || l2 > r1) {
        return false;
    }
    if (u1 > d2 || u2 > d1) {
        return false;
    }
    console.log('Collision');
    return true;
}